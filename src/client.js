/**
 * 浏览器半区（由 scripts/build.mjs 内联立绘后产出 lib/client.js）。
 *
 * 做四件事：
 *   1. 注入一张样式表：背景层、立绘层、玻璃质感、装饰；
 *   2. 往 document.body 上写 --dsw-alias-* 令牌（明/暗两套），
 *      这是 DSH 官方的换肤入口 —— 不覆盖具体元素，换版才不会改坏；
 *   3. 建一个 position:fixed / z-index:-1 的背景层，把春日橱窗与两张立绘放在界面之下；
 *   4. 往「设置」注册一个分区，可以开关皮肤与立绘。
 *
 * 持久化用 localStorage；所有副作用都通过 ctx.effect 注册清理。
 */

window.__ModuleLoader__.load({
  id: 'dsh-firefly-spring-skin',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports

    const React = require('react')
    const h = React.createElement

    const PKG = 'dsh-firefly-spring-skin'
    const NS = PKG
    const HOST_CLASS = 'dsh-ffs-on'
    const STYLE_ID = 'dsh-ffs-style'
    const LAYER_ID = 'dsh-ffs-layer'
    const KEY_ENABLED = PKG + ':enabled'
    const KEY_ART = PKG + ':art'

    /* ============================================================
       立绘（构建时内联成 data URI）
       ============================================================ */
    const ART_LEFT = '__ASSET_LEFT__'
    const ART_RIGHT = '__ASSET_RIGHT__'

    /* ============================================================
       令牌：春信（浅色）
       ============================================================ */
    const LIGHT = {
      '--dsw-alias-bg-base': 'rgba(247, 245, 236, .40)',
      '--dsw-alias-bg-layer-1': 'rgba(255, 253, 247, .56)',
      '--dsw-alias-bg-layer-2': 'rgba(255, 255, 255, .78)',
      '--dsw-alias-bg-layer-3': 'rgba(255, 255, 255, .88)',
      '--dsw-alias-bg-overlay': 'rgba(255, 253, 247, .92)',
      '--dsw-alias-bg-mask-1': 'rgba(44, 58, 49, .28)',
      '--dsw-alias-bg-mask-2': 'rgba(44, 58, 49, .42)',
      '--dsw-alias-bg-mask-3': 'rgba(44, 58, 49, .58)',
      '--dsw-alias-bg-skeleton': 'rgba(207, 224, 188, .45)',
      '--dsw-specific-sidebar-fill': 'rgba(255, 253, 247, .42)',

      '--dsw-alias-label-primary': '#2C3A31',
      '--dsw-alias-label-primary-foreground': '#2C3A31',
      '--dsw-alias-label-secondary': '#4E6058',
      '--dsw-alias-label-tertiary': '#6B7D73',
      '--dsw-alias-label-caption': '#7C8E83',
      '--dsw-alias-label-dimmed': '#93A096',
      '--dsw-alias-label-primary-inverted': '#FFFFFF',

      '--dsw-alias-brand-primary': '#7FA85C',
      '--dsw-alias-brand-primary-invert': '#FFFFFF',
      '--dsw-alias-brand-text': '#5C8A4A',
      '--dsw-alias-link': '#5C8A4A',

      '--dsw-alias-border-l1': 'rgba(150, 175, 145, .20)',
      '--dsw-alias-border-l2': 'rgba(150, 175, 145, .28)',
      '--dsw-alias-border-l3': 'rgba(150, 175, 145, .36)',
      '--dsw-alias-border-l4': 'rgba(150, 175, 145, .46)',

      '--dsw-alias-button-primary-fill': '#7FA85C',
      '--dsw-alias-button-primary-hover': '#6E9A4E',
      '--dsw-alias-button-primary-dimmed': 'rgba(127, 168, 92, .45)',
      '--dsw-alias-button-info-fill': '#7FA85C',
      '--dsw-alias-button-info-hover': '#6E9A4E',
      '--dsw-alias-button-elevated-fill': 'rgba(255, 255, 255, .86)',
      '--dsw-alias-button-floating-fill': 'rgba(255, 255, 255, .90)',
      '--dsw-alias-button-floating-hover': '#FFFFFF',
      '--dsw-alias-button-ghost-active-fill': 'rgba(127, 168, 92, .14)',
      '--dsw-alias-button-ghost-active-border': 'rgba(127, 168, 92, .38)',
      '--dsw-alias-button-ghost-active-hover': 'rgba(127, 168, 92, .22)',
      '--dsw-alias-button-tool-bar-fill': 'rgba(255, 255, 255, .70)',

      '--dsw-alias-interactive-bg-hover': 'rgba(127, 168, 92, .10)',
      '--dsw-alias-interactive-bg-active': 'rgba(127, 168, 92, .17)',
      '--dsw-alias-interactive-bg-hover-accent': 'rgba(127, 168, 92, .15)',
      '--dsw-alias-interactive-bg-hover-solid': 'rgba(127, 168, 92, .20)',
      '--dsw-alias-interactive-bg-hover-danger': 'rgba(194, 86, 79, .12)',

      '--dsw-alias-markdown-code-block': 'rgba(237, 244, 227, .80)',
      '--dsw-alias-markdown-code-block-banner': 'rgba(207, 224, 188, .72)',
      '--dsw-alias-markdown-inline-code': 'rgba(207, 224, 188, .58)',
      '--dsw-alias-markdown-citation': 'rgba(127, 168, 92, .16)',
      '--dsw-alias-markdown-tag': 'rgba(232, 169, 184, .22)',

      '--dsw-alias-state-success-primary': '#5C8A4A',
      '--dsw-alias-state-success-secondary': 'rgba(127, 168, 92, .26)',
      '--dsw-alias-state-success-tertiary': 'rgba(127, 168, 92, .14)',
      '--dsw-alias-state-error-primary': '#C2564F',
      '--dsw-alias-state-error-secondary': 'rgba(194, 86, 79, .22)',
      '--dsw-alias-state-warn-primary': '#C08A2B',
      '--dsw-alias-state-warn-label': '#9A6E1E',
      '--dsw-alias-state-warn-secondary': 'rgba(192, 138, 43, .22)',
      '--dsw-alias-state-warn-tertiary': 'rgba(192, 138, 43, .12)',
      '--dsw-alias-state-business-primary': '#5C8A4A',
      '--dsw-alias-state-business-tertiary': 'rgba(127, 168, 92, .14)',
      '--dsw-alias-state-idle-primary': '#93A096',

      '--dsw-alias-code-diff-added': 'rgba(127, 168, 92, .18)',
      '--dsw-alias-code-diff-deleted': 'rgba(194, 86, 79, .16)',

      '--dsw-alias-settings-card-fill': 'rgba(255, 255, 255, .66)',
      '--dsw-alias-settings-card-stroke': 'rgba(150, 175, 145, .26)',

      '--dsw-alias-scrollbar-bg-l1': 'rgba(150, 175, 145, .20)',
      '--dsw-alias-scrollbar-bg-l2': 'rgba(150, 175, 145, .16)',
      '--dsw-alias-scrollbar-hover-l1': 'rgba(127, 168, 92, .40)',
      '--dsw-alias-scrollbar-hover-l2': 'rgba(127, 168, 92, .34)',

      '--dsw-alias-tooltip-bg': 'rgba(44, 58, 49, .94)',
      '--dsw-alias-toast-bg': 'rgba(255, 253, 247, .96)',
      '--dsw-alias-toast-label': '#2C3A31',
      '--dsw-menu-surface-fill': 'rgba(255, 253, 247, .94)',
      '--dsw-alias-menu-group-header-fill': 'rgba(237, 244, 227, .70)',
      '--dsw-alias-menu-icon': '#5C8A4A',

      '--dsw-specific-bubble': 'rgba(255, 255, 255, .78)',
      '--dsw-specific-bubble-highlight': 'rgba(237, 244, 227, .86)',
      '--dsw-specific-input-major': 'rgba(255, 255, 255, .88)',
      '--dsw-specific-selector': 'rgba(255, 255, 255, .82)',
      '--dsw-specific-menu': 'rgba(255, 253, 247, .94)',
      '--dsw-specific-tip': 'rgba(237, 244, 227, .86)',
      '--dsw-specific-sidebar-nav-item-hover': 'rgba(127, 168, 92, .12)',
      '--dsw-specific-sidebar-nav-item-active': 'rgba(127, 168, 92, .18)',
      '--dsw-specific-sidebar-nav-item-active-accent': '#7FA85C',

      '--dsw-alias-switch-thumb': '#FFFFFF',
      '--dsw-focus-ring-color': 'rgba(127, 168, 92, .55)',
      '--dsw-alias-turn-trigger-bg': 'rgba(237, 244, 227, .70)',
      '--dsw-alias-turn-trigger-bg-hover': 'rgba(207, 224, 188, .80)'
    }

    /* ============================================================
       令牌：夜萤（深色）
       ============================================================ */
    const DARK = {
      '--dsw-alias-bg-base': 'rgba(16, 26, 22, .50)',
      '--dsw-alias-bg-layer-1': 'rgba(24, 36, 31, .64)',
      '--dsw-alias-bg-layer-2': 'rgba(30, 44, 38, .84)',
      '--dsw-alias-bg-layer-3': 'rgba(36, 52, 45, .92)',
      '--dsw-alias-bg-overlay': 'rgba(20, 30, 26, .94)',
      '--dsw-alias-bg-mask-1': 'rgba(0, 0, 0, .34)',
      '--dsw-alias-bg-mask-2': 'rgba(0, 0, 0, .50)',
      '--dsw-alias-bg-mask-3': 'rgba(0, 0, 0, .66)',
      '--dsw-alias-bg-skeleton': 'rgba(143, 224, 160, .14)',
      '--dsw-specific-sidebar-fill': 'rgba(20, 32, 27, .52)',

      '--dsw-alias-label-primary': '#E8F2E7',
      '--dsw-alias-label-primary-foreground': '#E8F2E7',
      '--dsw-alias-label-secondary': '#B6CBBE',
      '--dsw-alias-label-tertiary': '#98B0A3',
      '--dsw-alias-label-caption': '#8AA396',
      '--dsw-alias-label-dimmed': '#728B7D',
      '--dsw-alias-label-primary-inverted': '#10201A',

      '--dsw-alias-brand-primary': '#8FE0A0',
      '--dsw-alias-brand-primary-invert': '#10201A',
      '--dsw-alias-brand-text': '#8FE0A0',
      '--dsw-alias-link': '#8FE0A0',

      '--dsw-alias-border-l1': 'rgba(143, 224, 160, .12)',
      '--dsw-alias-border-l2': 'rgba(143, 224, 160, .18)',
      '--dsw-alias-border-l3': 'rgba(143, 224, 160, .24)',
      '--dsw-alias-border-l4': 'rgba(143, 224, 160, .32)',

      '--dsw-alias-button-primary-fill': '#6FCB88',
      '--dsw-alias-button-primary-hover': '#8FE0A0',
      '--dsw-alias-button-primary-dimmed': 'rgba(111, 203, 136, .40)',
      '--dsw-alias-button-info-fill': '#6FCB88',
      '--dsw-alias-button-info-hover': '#8FE0A0',
      '--dsw-alias-button-elevated-fill': 'rgba(36, 52, 45, .88)',
      '--dsw-alias-button-floating-fill': 'rgba(30, 44, 38, .92)',
      '--dsw-alias-button-floating-hover': 'rgba(42, 60, 52, .96)',
      '--dsw-alias-button-ghost-active-fill': 'rgba(143, 224, 160, .14)',
      '--dsw-alias-button-ghost-active-border': 'rgba(143, 224, 160, .34)',
      '--dsw-alias-button-ghost-active-hover': 'rgba(143, 224, 160, .20)',
      '--dsw-alias-button-tool-bar-fill': 'rgba(30, 44, 38, .70)',

      '--dsw-alias-interactive-bg-hover': 'rgba(143, 224, 160, .10)',
      '--dsw-alias-interactive-bg-active': 'rgba(143, 224, 160, .16)',
      '--dsw-alias-interactive-bg-hover-accent': 'rgba(143, 224, 160, .14)',
      '--dsw-alias-interactive-bg-hover-solid': 'rgba(143, 224, 160, .18)',
      '--dsw-alias-interactive-bg-hover-danger': 'rgba(226, 122, 116, .14)',

      '--dsw-alias-markdown-code-block': 'rgba(12, 20, 17, .80)',
      '--dsw-alias-markdown-code-block-banner': 'rgba(28, 42, 36, .90)',
      '--dsw-alias-markdown-inline-code': 'rgba(143, 224, 160, .14)',
      '--dsw-alias-markdown-citation': 'rgba(143, 224, 160, .14)',
      '--dsw-alias-markdown-tag': 'rgba(233, 166, 182, .18)',

      '--dsw-alias-state-success-primary': '#8FE0A0',
      '--dsw-alias-state-success-secondary': 'rgba(143, 224, 160, .22)',
      '--dsw-alias-state-success-tertiary': 'rgba(143, 224, 160, .12)',
      '--dsw-alias-state-error-primary': '#E27A74',
      '--dsw-alias-state-error-secondary': 'rgba(226, 122, 116, .22)',
      '--dsw-alias-state-warn-primary': '#E0B069',
      '--dsw-alias-state-warn-label': '#E8C489',
      '--dsw-alias-state-warn-secondary': 'rgba(224, 176, 105, .22)',
      '--dsw-alias-state-warn-tertiary': 'rgba(224, 176, 105, .12)',
      '--dsw-alias-state-business-primary': '#8FE0A0',
      '--dsw-alias-state-business-tertiary': 'rgba(143, 224, 160, .12)',
      '--dsw-alias-state-idle-primary': '#728B7D',

      '--dsw-alias-code-diff-added': 'rgba(143, 224, 160, .16)',
      '--dsw-alias-code-diff-deleted': 'rgba(226, 122, 116, .16)',

      '--dsw-alias-settings-card-fill': 'rgba(30, 44, 38, .72)',
      '--dsw-alias-settings-card-stroke': 'rgba(143, 224, 160, .16)',

      '--dsw-alias-scrollbar-bg-l1': 'rgba(143, 224, 160, .14)',
      '--dsw-alias-scrollbar-bg-l2': 'rgba(143, 224, 160, .10)',
      '--dsw-alias-scrollbar-hover-l1': 'rgba(143, 224, 160, .32)',
      '--dsw-alias-scrollbar-hover-l2': 'rgba(143, 224, 160, .26)',

      '--dsw-alias-tooltip-bg': 'rgba(10, 18, 15, .96)',
      '--dsw-alias-toast-bg': 'rgba(24, 36, 31, .96)',
      '--dsw-alias-toast-label': '#E8F2E7',
      '--dsw-menu-surface-fill': 'rgba(24, 36, 31, .96)',
      '--dsw-alias-menu-group-header-fill': 'rgba(143, 224, 160, .08)',
      '--dsw-alias-menu-icon': '#8FE0A0',

      '--dsw-specific-bubble': 'rgba(30, 44, 38, .80)',
      '--dsw-specific-bubble-highlight': 'rgba(143, 224, 160, .10)',
      '--dsw-specific-input-major': 'rgba(24, 36, 31, .90)',
      '--dsw-specific-selector': 'rgba(30, 44, 38, .86)',
      '--dsw-specific-menu': 'rgba(24, 36, 31, .96)',
      '--dsw-specific-tip': 'rgba(143, 224, 160, .10)',
      '--dsw-specific-sidebar-nav-item-hover': 'rgba(143, 224, 160, .10)',
      '--dsw-specific-sidebar-nav-item-active': 'rgba(143, 224, 160, .16)',
      '--dsw-specific-sidebar-nav-item-active-accent': '#8FE0A0',

      '--dsw-alias-switch-thumb': '#E8F2E7',
      '--dsw-focus-ring-color': 'rgba(143, 224, 160, .55)',
      '--dsw-alias-turn-trigger-bg': 'rgba(143, 224, 160, .12)',
      '--dsw-alias-turn-trigger-bg-hover': 'rgba(143, 224, 160, .18)'
    }

    /* ============================================================
       样式表：背景层 + 立绘层 + 玻璃质感
       ============================================================ */
    const CSS = `
html.${HOST_CLASS}, html.${HOST_CLASS} body { background-color: transparent !important; }

#${LAYER_ID} {
  position: fixed; inset: 0; z-index: -1;
  pointer-events: none; overflow: hidden;
}

/* 春日橱窗：暖光 + 拱窗 + 地面 */
#${LAYER_ID} .ffs-scene {
  position: absolute; inset: 0;
  background:
    radial-gradient(68vw 46vw at 74% 8%, rgba(255, 253, 244, .95), transparent 62%),
    radial-gradient(52vw 40vw at 8% 92%, rgba(207, 224, 188, .70), transparent 62%),
    linear-gradient(158deg, #FAF8F0 0%, #EDEADB 58%, #E7EBDD 100%);
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-scene {
  background:
    radial-gradient(64vw 44vw at 72% 6%, rgba(143, 224, 160, .16), transparent 64%),
    radial-gradient(50vw 38vw at 8% 94%, rgba(86, 156, 122, .22), transparent 64%),
    radial-gradient(70vw 50vw at 50% 50%, rgba(28, 46, 38, .90), rgba(0, 0, 0, 0) 72%),
    linear-gradient(158deg, #1B2C25 0%, #131F1A 58%, #1A2A23 100%);
}

/* 拱窗线稿（用 conic/radial 拼，不额外请求资源） */
#${LAYER_ID} .ffs-window {
  position: absolute; right: 6vw; top: 4vh;
  width: 34vw; height: 72vh;
  border: 2px solid rgba(150, 175, 145, .34);
  border-radius: 50% 50% 6px 6px;
  background: linear-gradient(180deg, rgba(255, 246, 214, .34), rgba(255, 255, 255, 0) 70%);
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-window {
  border-color: rgba(143, 224, 160, .16);
  background: linear-gradient(180deg, rgba(143, 224, 160, .12), rgba(0, 0, 0, 0) 72%);
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-window::before,
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-window::after {
  background: rgba(143, 224, 160, .12);
}
#${LAYER_ID} .ffs-window::before,
#${LAYER_ID} .ffs-window::after {
  content: ''; position: absolute; background: rgba(150, 175, 145, .26);
}
#${LAYER_ID} .ffs-window::before { left: 50%; top: 0; width: 1px; height: 100%; }
#${LAYER_ID} .ffs-window::after  { left: 0; top: 52%; width: 100%; height: 1px; }

/* 光束 */
#${LAYER_ID} .ffs-ray {
  position: absolute; top: -10vh; right: 4vw;
  width: 46vw; height: 120vh;
  background: linear-gradient(200deg, rgba(255, 233, 168, .34), rgba(255, 233, 168, 0) 62%);
  transform: skewX(-14deg);
}

/* 立绘 */
#${LAYER_ID} .ffs-char {
  position: absolute; bottom: -3vh;
  filter: drop-shadow(0 24px 30px rgba(48, 62, 48, .30));
  user-select: none; -webkit-user-drag: none;
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-char {
  filter: drop-shadow(0 24px 32px rgba(0, 0, 0, .50)) brightness(1.22) saturate(.94);
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-ray {
  background: linear-gradient(200deg, rgba(143, 224, 160, .14), rgba(143, 224, 160, 0) 62%);
}
#${LAYER_ID} .ffs-left  { left: 15vw; height: 76vh; }
#${LAYER_ID} .ffs-right { right: 0.5vw; height: 58vh; transform: scaleX(-1); }
html.${HOST_CLASS} .dsh-ffs-noart #${LAYER_ID} .ffs-char { display: none; }

/* 中心聚光遮罩：保证中间内容列的文字对比度，两侧留给立绘。
   它在层内最后绘制，所以会盖住中央的立绘，但把两侧让出来。 */
#${LAYER_ID} .ffs-scrim {
  position: absolute; inset: 0;
  background: radial-gradient(42vw 84vh at 54% 50%,
    rgba(252, 250, 243, .92) 0%, rgba(252, 250, 243, .74) 42%,
    rgba(252, 250, 243, 0) 74%);
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-scrim {
  background: radial-gradient(42vw 84vh at 54% 50%,
    rgba(12, 20, 17, .90) 0%, rgba(12, 20, 17, .72) 42%,
    rgba(12, 20, 17, 0) 74%);
}

/* 面板玻璃质感：让背景透出来 */
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-scene { filter: saturate(105%); }

/* 花瓣与萤火 */
#${LAYER_ID} .ffs-petal {
  position: absolute; border-radius: 60% 40% 55% 45%;
  background: rgba(241, 189, 203, .70);
}
#${LAYER_ID} .ffs-fly {
  position: absolute; border-radius: 50%;
  background: #A9E38C;
  box-shadow: 0 0 14px 5px rgba(169, 227, 140, .45);
}
html.${HOST_CLASS} body[data-ds-dark-theme] #${LAYER_ID} .ffs-fly {
  background: #B6F2A0; box-shadow: 0 0 18px 7px rgba(182, 242, 160, .42);
}

@media (max-width: 1100px) {
  #${LAYER_ID} .ffs-left  { left: 16vw; height: 74vh; }
  #${LAYER_ID} .ffs-right { height: 52vh; }
}
`

    /* ============================================================
       状态
       ============================================================ */
    const listeners = new Set()
    let state = { enabled: true, art: true }
    let applied = []

    function readBool(key, fallback) {
      try {
        const raw = localStorage.getItem(key)
        if (raw === null) return fallback
        return raw === '1' || raw === 'true'
      } catch (e) {
        return fallback
      }
    }
    function writeBool(key, value) {
      try {
        localStorage.setItem(key, value ? '1' : '0')
      } catch (e) {
        /* 隐私模式下写不进去，忽略 */
      }
    }
    function emit() {
      const snapshot = { enabled: state.enabled, art: state.art }
      listeners.forEach(function (fn) {
        try {
          fn(snapshot)
        } catch (e) {
          console.error('[' + PKG + '] listener failed', e)
        }
      })
    }

    /* ============================================================
       背景层
       ============================================================ */
    function buildLayer() {
      const layer = document.createElement('div')
      layer.id = LAYER_ID
      layer.setAttribute('aria-hidden', 'true')

      const scene = document.createElement('div')
      scene.className = 'ffs-scene'
      layer.appendChild(scene)

      const ray = document.createElement('div')
      ray.className = 'ffs-ray'
      layer.appendChild(ray)

      const win = document.createElement('div')
      win.className = 'ffs-window'
      layer.appendChild(win)

      const petals = [
        [12, 18, 12, 8, -24], [46, 30, 10, 7, 18], [31, 62, 9, 6, 40],
        [78, 24, 11, 7, -12], [63, 74, 10, 7, 64], [88, 58, 9, 6, -38],
        [24, 82, 11, 7, 28], [55, 88, 10, 6, -52]
      ]
      petals.forEach(function (p) {
        const el = document.createElement('div')
        el.className = 'ffs-petal'
        el.style.left = p[0] + 'vw'
        el.style.top = p[1] + 'vh'
        el.style.width = p[2] + 'px'
        el.style.height = p[3] + 'px'
        el.style.transform = 'rotate(' + p[4] + 'deg)'
        layer.appendChild(el)
      })

      const flies = [[86, 20, 6], [76, 44, 5], [90, 62, 7], [70, 80, 5], [52, 14, 4], [40, 90, 5]]
      flies.forEach(function (f) {
        const el = document.createElement('div')
        el.className = 'ffs-fly'
        el.style.left = f[0] + 'vw'
        el.style.top = f[1] + 'vh'
        el.style.width = f[2] + 'px'
        el.style.height = f[2] + 'px'
        layer.appendChild(el)
      })

      const left = document.createElement('img')
      left.className = 'ffs-char ffs-left'
      left.alt = ''
      left.decoding = 'async'
      left.src = ART_LEFT
      layer.appendChild(left)

      const right = document.createElement('img')
      right.className = 'ffs-char ffs-right'
      right.alt = ''
      right.decoding = 'async'
      right.src = ART_RIGHT
      layer.appendChild(right)

      /* 聚光遮罩最后加：层内绘制顺序 = 它盖住中央的立绘 */
      const scrim = document.createElement('div')
      scrim.className = 'ffs-scrim'
      layer.appendChild(scrim)

      document.body.appendChild(layer)
      return layer
    }

    /* ============================================================
       令牌应用
       ============================================================ */
    function clearTokens() {
      const body = document.body
      if (!body) return
      applied.forEach(function (n) {
        body.style.removeProperty(n)
      })
      applied = []
    }
    function paintTokens() {
      const body = document.body
      if (!body) return
      clearTokens()
      const dark = body.hasAttribute('data-ds-dark-theme')
      const table = dark ? DARK : LIGHT
      Object.keys(table).forEach(function (n) {
        body.style.setProperty(n, table[n])
        applied.push(n)
      })
    }

    /* ============================================================
       打开 / 关闭
       ============================================================ */
    function setEnabled(on) {
      const root = document.documentElement
      const body = document.body
      if (!body) return
      if (on) {
        root.classList.add(HOST_CLASS)
        if (!document.getElementById(LAYER_ID)) buildLayer()
        paintTokens()
      } else {
        root.classList.remove(HOST_CLASS)
        const layer = document.getElementById(LAYER_ID)
        if (layer) layer.remove()
        clearTokens()
      }
      body.classList.toggle('dsh-ffs-noart', !state.art)
    }
    function setArt(on) {
      if (document.body) document.body.classList.toggle('dsh-ffs-noart', !on)
    }

    /* ============================================================
       设置项 UI（手写，不依赖宿主 primitives）
       ============================================================ */
    const rowStyle = {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', padding: '14px 16px', borderRadius: 'var(--dsw-radius-md, 12px)',
      background: 'var(--dsw-alias-settings-card-fill, rgba(255,255,255,.6))',
      border: '1px solid var(--dsw-alias-settings-card-stroke, rgba(0,0,0,.08))',
      marginBottom: '10px'
    }
    const titleStyle = { fontSize: '14px', color: 'var(--dsw-alias-label-primary, #222)', lineHeight: '20px' }
    const hintStyle = { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary, #888)', lineHeight: '18px', marginTop: '2px' }

    function Toggle(props) {
      const on = props.checked
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': on ? 'true' : 'false',
        onClick: function () { props.onChange(!on) },
        style: {
          flex: '0 0 auto', width: '44px', height: '24px', padding: '2px',
          borderRadius: '999px', cursor: 'pointer', border: 'none',
          background: on ? 'var(--dsw-alias-brand-primary, #7FA85C)' : 'var(--dsw-alias-border-l3, #ccc)',
          transition: 'background .18s ease', display: 'flex',
          alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start'
        }
      }, h('span', {
        style: {
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'var(--dsw-alias-switch-thumb, #fff)',
          boxShadow: '0 1px 3px rgba(0,0,0,.25)', display: 'block'
        }
      }))
    }

    let t = function (k) { return k }

    function Section() {
      const [local, setLocal] = React.useState({ enabled: state.enabled, art: state.art })
      React.useEffect(function () {
        listeners.add(setLocal)
        return function () { listeners.delete(setLocal) }
      }, [])

      return h('div', { style: { padding: '4px 0' } },
        h('div', { style: rowStyle },
          h('div', null,
            h('div', { style: titleStyle }, t('enable')),
            h('div', { style: hintStyle }, t('enableHint'))
          ),
          h(Toggle, {
            checked: local.enabled,
            onChange: function (v) {
              state.enabled = v
              writeBool(KEY_ENABLED, v)
              setEnabled(v)
              emit()
            }
          })
        ),
        h('div', { style: rowStyle },
          h('div', null,
            h('div', { style: titleStyle }, t('art')),
            h('div', { style: hintStyle }, t('artHint'))
          ),
          h(Toggle, {
            checked: local.art,
            onChange: function (v) {
              state.art = v
              writeBool(KEY_ART, v)
              setArt(v)
              emit()
            }
          })
        )
      )
    }

    /* ============================================================
       装配
       ============================================================ */
    function apply(ctx) {
      state.enabled = readBool(KEY_ENABLED, true)
      state.art = readBool(KEY_ART, true)

      /* 样式表 */
      ctx.effect(function () {
        if (!document.getElementById(STYLE_ID)) {
          const style = document.createElement('style')
          style.id = STYLE_ID
          style.textContent = CSS
          document.head.appendChild(style)
        }
        return function () {
          const style = document.getElementById(STYLE_ID)
          if (style) style.remove()
        }
      }, PKG + ': stylesheet')

      /* 开皮肤 */
      ctx.effect(function () {
        setEnabled(state.enabled)
        return function () {
          setEnabled(false)
        }
      }, PKG + ': theme layer')

      /* 明暗切换时重刷令牌 */
      ctx.effect(function () {
        const body = document.body
        if (!body) return
        const observer = new MutationObserver(function () {
          if (state.enabled) paintTokens()
        })
        observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
        return function () { observer.disconnect() }
      }, PKG + ': dark-mode observer')

      /* 本地化 */
      ctx.effect(function () {
        if (ctx.locale === undefined || ctx.locale === null) return
        return ctx.locale.register(NS, {
          zh: {
            nav: '春日手信',
            enable: '启用「春日手信」皮肤',
            enableHint: '春草绿配色 + 玻璃面板 + 春日橱窗背景',
            art: '显示桌面立绘',
            artHint: '关掉只保留配色与背景'
          },
          en: {
            nav: 'Spring Missive',
            enable: 'Enable the Spring Missive skin',
            enableHint: 'Spring-green palette, glass panels and a spring-window backdrop',
            art: 'Show desktop character art',
            artHint: 'Turn off to keep only colours and backdrop'
          }
        })
      }, PKG + ': locale')

      ctx.effect(function () {
        if (ctx.locale !== undefined && ctx.locale !== null) {
          try { t = ctx.locale.bind(NS) } catch (e) { /* 保持回退 */ }
        }
      }, PKG + ': locale binding')

      /* 设置分区 */
      if (ctx.slots !== undefined && ctx.slots !== null) {
        ctx.slots.inject('settings.section', function () {
          return ctx.slots.register({
            name: 'settings.section',
            id: PKG,
            order: 42,
            label: function () { return t('nav') },
            locale: NS,
            inject: function () {
              return { enabled: state.enabled, art: state.art }
            }
          }, Section)
        })
      }
    }

    const name = 'firefly-spring-skin'
    const inject = ['theme', 'slots', 'locale']

    exports.name = name
    exports.inject = inject
    exports.apply = apply
    return module.exports
  }
})
