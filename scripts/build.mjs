/**
 * 构建：src/ → lib/
 *
 *   1. src/host.js   → lib/index.js    （宿主半区，直接复制）
 *   2. src/client.js → lib/client.js   （浏览器半区，把两张立绘内联成 data URI）
 *
 * 为什么要内联立绘：浏览器半区只通过 /plugins/<id>/client.js 这一个入口送达，
 * 包内的图片没有现成的静态路由。内联成 data URI 之后零请求、零跨域、离线可用，
 * 代价是 client.js 变大 —— 与 dsh-dream-skin / dsh-opencode-palette 的做法一致。
 *
 * 用法：node scripts/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const LIB = join(ROOT, 'lib')

/** 读一张图并转成 data URI。 */
function dataUri(relPath, mime) {
  const buf = readFileSync(join(ROOT, relPath))
  return `data:${mime};base64,${buf.toString('base64')}`
}

mkdirSync(LIB, { recursive: true })

// ---- 宿主半区 ----
const host = readFileSync(join(ROOT, 'src', 'host.js'), 'utf8')
writeFileSync(join(LIB, 'index.js'), host, 'utf8')
console.log(`lib/index.js   ${host.length} bytes`)

// ---- 浏览器半区 ----
let client = readFileSync(join(ROOT, 'src', 'client.js'), 'utf8')

const left = dataUri('assets/character-left.webp', 'image/webp')
const right = dataUri('assets/character-right.webp', 'image/webp')

for (const [token, value] of [['__ASSET_LEFT__', left], ['__ASSET_RIGHT__', right]]) {
  if (!client.includes(token)) {
    console.error(`src/client.js 里找不到占位符 ${token}`)
    process.exit(1)
  }
  client = client.split(token).join(value)
}

writeFileSync(join(LIB, 'client.js'), client, 'utf8')
console.log(`lib/client.js  ${client.length} bytes  (立绘已内联)`)
