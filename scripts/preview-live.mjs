/**
 * 真机视觉验证：用无头 Edge + CDP 打开正在运行的 DSH 页面，
 * 把 lib/client.js 的浏览器半区注入进去跑一遍，然后截图。
 *
 * 不会安装插件、不碰 profile —— 只是把皮肤"套"在真实界面上看一眼。
 *
 * 用法：
 *   node scripts/preview-live.mjs <dsh-url> [输出png] [宽度] [高度]
 * 例：
 *   node scripts/preview-live.mjs "http://127.0.0.1:19387/?token=xxxx" preview/live.png
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const [, , dshUrl, outArg = 'preview/live.png', wArg = '1920', hArg = '1080', modeArg = ''] = process.argv

if (!dshUrl) {
  console.error('用法: node scripts/preview-live.mjs <dsh-url> [out.png] [width] [height] [light|dark]')
  process.exit(2)
}
const OUT = join(ROOT, outArg)
const WIDTH = Number(wArg)
const HEIGHT = Number(hArg)
/** 强制明/暗模式，便于验证两套令牌；留空则跟随宿主当前设置。 */
const MODE = modeArg === 'light' || modeArg === 'dark' ? modeArg : ''

const EDGE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
]
const EDGE = EDGE_CANDIDATES.find((p) => existsSync(p))
if (!EDGE) {
  console.error('找不到 msedge.exe')
  process.exit(2)
}

const PORT = 9223
const profileDir = join(tmpdir(), 'dsh-ffs-cdp-profile')
rmSync(profileDir, { recursive: true, force: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const child = spawn(EDGE, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-crash-reporter',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profileDir}`,
  `--window-size=${WIDTH},${HEIGHT}`,
  'about:blank'
], { stdio: 'ignore' })

/** 等到 devtools 端点起来，返回一个页面 target 的 ws 地址。 */
async function waitForTarget(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await r.json()
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch (e) { /* 还没起来 */ }
    await sleep(400)
  }
  throw new Error('devtools 端点超时')
}

/** 极简 CDP 客户端。 */
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let nextId = 1
  const pending = new Map()
  const events = []
  const waiters = []

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id !== undefined) {
      const p = pending.get(msg.id)
      if (p) {
        pending.delete(msg.id)
        msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result)
      }
    } else {
      events.push(msg)
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].method === msg.method) {
          waiters[i].resolve(msg.params)
          waiters.splice(i, 1)
        }
      }
    }
  })

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve)
    ws.addEventListener('error', reject)
  })

  return {
    ready,
    send(method, params = {}) {
      const id = nextId++
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params }))
      })
    },
    waitEvent(method, timeoutMs = 30000) {
      return new Promise((resolve, reject) => {
        const hit = events.find((e) => e.method === method)
        if (hit) return resolve(hit.params)
        const timer = setTimeout(() => reject(new Error(`等待 ${method} 超时`)), timeoutMs)
        waiters.push({ method, resolve: (p) => { clearTimeout(timer); resolve(p) } })
      })
    },
    close() { ws.close() }
  }
}

const clientSrc = readFileSync(join(ROOT, 'lib', 'client.js'), 'utf8')

/** 在页面里跑浏览器半区，返回一份体检报告。 */
const PROBE = `
(async () => {
  const captured = [];
  const prevLoader = window.__ModuleLoader__;
  window.__ModuleLoader__ = { load(def) { captured.push(def); } };
  try {
    (0, eval)(${JSON.stringify(clientSrc)});
  } finally {
    if (prevLoader === undefined) delete window.__ModuleLoader__;
    else window.__ModuleLoader__ = prevLoader;
  }
  const def = captured.find(d => d && d.id === 'dsh-firefly-spring-skin');
  if (!def) return { ok: false, why: 'factory 未注册' };

  const stubReact = {
    createElement: () => null,
    useState: () => [null, () => {}],
    useEffect: () => {}
  };
  const fakeRequire = (id) => (id === 'react' ? stubReact : {});
  const mod = def.factory(fakeRequire);

  const disposers = [];
  const ctx = {
    effect(fn) { const d = fn(); if (typeof d === 'function') disposers.push(d); return d; }
    // locale / slots 故意留空：这两条在真机上由宿主注入，视觉验证不需要
  };
  mod.apply(ctx);

  await new Promise(r => setTimeout(r, 1200));

  const body = document.body;
  const root = document.documentElement;
  const layer = document.getElementById('dsh-ffs-layer');
  const imgs = layer ? Array.from(layer.querySelectorAll('img')) : [];
  return {
    ok: true,
    name: mod.name,
    inject: mod.inject,
    hasStyle: !!document.getElementById('dsh-ffs-style'),
    hasLayer: !!layer,
    rootClass: root.className,
    tokenCount: body.style.length,
    bgBase: body.style.getPropertyValue('--dsw-alias-bg-base').trim(),
    brand: body.style.getPropertyValue('--dsw-alias-brand-primary').trim(),
    label: body.style.getPropertyValue('--dsw-alias-label-primary').trim(),
    artLoaded: imgs.map(i => i.complete && i.naturalWidth > 0),
    artSizes: imgs.map(i => i.naturalWidth + 'x' + i.naturalHeight)
  };
})()
`

try {
  const wsUrl = await waitForTarget()
  const cdp = connect(wsUrl)
  await cdp.ready

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false
  })

  console.log('打开 DSH 页面…')
  const loaded = cdp.waitEvent('Page.loadEventFired').catch(() => null)
  await cdp.send('Page.navigate', { url: dshUrl })
  await loaded
  console.log('等待前端启动…')
  await sleep(6000)

  if (MODE) {
    console.log(`强制 ${MODE} 模式…`)
    await cdp.send('Runtime.evaluate', {
      expression: MODE === 'dark'
        ? `document.body.setAttribute('data-ds-dark-theme',''); document.documentElement.style.colorScheme='dark'; 'ok'`
        : `document.body.removeAttribute('data-ds-dark-theme'); document.documentElement.style.colorScheme='light'; 'ok'`,
      returnByValue: true
    })
    await sleep(1200)
  }

  console.log('注入皮肤…')
  const res = await cdp.send('Runtime.evaluate', {
    expression: PROBE, awaitPromise: true, returnByValue: true
  })
  if (res.exceptionDetails) {
    console.error('页面内报错：', JSON.stringify(res.exceptionDetails).slice(0, 2000))
    process.exitCode = 1
  } else {
    console.log('体检报告：', JSON.stringify(res.result.value, null, 2))
  }

  await sleep(1500)
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' })
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, Buffer.from(shot.data, 'base64'))
  console.log(`截图已保存：${OUT}`)
  cdp.close()
} catch (err) {
  console.error('失败：', err && err.message ? err.message : err)
  process.exitCode = 1
} finally {
  child.kill()
  await sleep(600)
  rmSync(profileDir, { recursive: true, force: true })
}
