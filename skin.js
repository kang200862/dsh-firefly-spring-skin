/* ============================================================
   流萤「春日手信」 DSH 皮肤样板 · 单版
   背景场景为自己画的 SVG；人物立绘是本地 assets/ 里的图。
   想换立绘：直接替换 assets/character-left.webp / character-right.webp
   （是透明的 PNG/WebP 效果最好）。
   ============================================================ */
(function () {
  var ICON = {
    logo: '<path d="M4 5h16v11H9l-5 4z" fill="currentColor" stroke="none" opacity=".92"/>',
    chat: '<circle cx="12" cy="12" r="8.4"/>',
    plus: '<rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.4"/><path d="M12 8.4v7.2M8.4 12h7.2"/>',
    search: '<circle cx="11" cy="11" r="6.6"/><path d="M15.8 15.8 20.4 20.4"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.4v2.4M12 18.2v2.4M3.4 12h2.4M18.2 12h2.4M6 6l1.7 1.7M16.3 16.3 18 18M18 6l-1.7 1.7M7.7 16.3 6 18"/>',
    folder: '<path d="M3.6 7.2a2.4 2.4 0 0 1 2.4-2.4h3.2l2 2.4h7a2.4 2.4 0 0 1 2.4 2.4v7.2a2.4 2.4 0 0 1-2.4 2.4H6a2.4 2.4 0 0 1-2.4-2.4z"/>',
    sort: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    up: '<path d="M12 19V6M6 12l6-6 6 6"/>'
  };
  function svg(d, size, w) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="' + (w || 1.9) + '" stroke-linecap="round" ' +
      'stroke-linejoin="round">' + d + '</svg>';
  }

  /* ============================================================
     背景场景：春日橱窗（拱窗 + 花箱 + 铁艺招牌 + 地面）
     ============================================================ */
  var BLOOMS = '';
  (function () {
    var spots = [[1188, 806], [1226, 792], [1268, 810], [1310, 792], [1350, 808],
                 [1640, 808], [1682, 792], [1722, 810], [1762, 794], [1796, 808]];
    for (var i = 0; i < spots.length; i++) {
      var x = spots[i][0], y = spots[i][1];
      BLOOMS += '<circle class="s-bloom" cx="' + x + '" cy="' + y + '" r="13"/>' +
                '<circle class="s-bloom2" cx="' + (x - 4) + '" cy="' + (y - 4) + '" r="5"/>';
    }
    var leaves = [[1210, 830], [1290, 836], [1360, 828], [1660, 830], [1740, 836], [1800, 826]];
    for (var j = 0; j < leaves.length; j++) {
      BLOOMS += '<ellipse class="s-leaf" cx="' + leaves[j][0] + '" cy="' + leaves[j][1] +
                '" rx="26" ry="10" transform="rotate(' + (j % 2 ? 12 : -12) + ' ' + leaves[j][0] + ' ' + leaves[j][1] + ')"/>';
    }
  })();

  var ART_SCENE =
    '<svg class="scene" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true">' +
      /* 阳光光束 */
      '<path class="s-ray" d="M1290 240 L560 1080 H820 L1420 240 Z"/>' +
      '<path class="s-ray" d="M1560 240 L900 1080 H1100 L1660 240 Z"/>' +
      /* 拱窗（整体上移，让窗台花箱落在输入框之上） */
      '<g transform="translate(0,-58)">' +
        '<path class="s-glow" d="M1180 812 V432 A300 300 0 0 1 1780 432 V812 Z" opacity=".55"/>' +
        '<path class="s-line" d="M1180 812 V432 A300 300 0 0 1 1780 432 V812" stroke-width="9" stroke="#B3A98A"/>' +
        '<path class="s-line2" d="M1204 812 V436 A276 276 0 0 1 1756 436 V812" stroke-width="2"/>' +
        '<path class="s-line2" d="M1380 168 V812 M1580 168 V812 M1204 470 H1756 M1204 640 H1756" stroke-width="2.4"/>' +
        '<path class="s-line2" d="M1180 812 H1780" stroke-width="6" stroke="#B3A98A"/>' +
        /* 窗台花箱 */
        '<rect class="s-box" x="1140" y="812" width="680" height="46" rx="10"/>' +
        BLOOMS +
      '</g>' +
      /* 顶部垂藤 */
      '<g opacity=".85">' +
        '<path class="s-line2" d="M0 22 C240 60 470 14 720 46 C980 80 1230 20 1500 52 C1700 74 1830 40 1920 56" stroke-width="3" stroke="#AFC49C"/>' +
        '<circle class="s-leaf" cx="180" cy="46" r="9"/><circle class="s-leaf2" cx="360" cy="30" r="8"/>' +
        '<circle class="s-leaf" cx="560" cy="36" r="9"/><circle class="s-leaf2" cx="900" cy="52" r="8"/>' +
        '<circle class="s-leaf" cx="1120" cy="40" r="9"/><circle class="s-leaf2" cx="1420" cy="44" r="8"/>' +
        '<circle class="s-leaf" cx="1660" cy="56" r="9"/>' +
      '</g>' +
      /* 地面 */
      '<path class="s-floor" d="M0 880 C420 858 900 902 1920 866 V1080 H0 Z"/>' +
      '<path class="s-line2" d="M0 884 C420 862 900 906 1920 870" stroke-width="2" opacity=".7"/>' +
    '</svg>';

  /* ============================================================
     天气层：花瓣 + 萤火
     ============================================================ */
  var ART_WEATHER =
    '<svg class="weather" viewBox="0 0 1920 1080" aria-hidden="true">' +
      '<g>' +
        '<ellipse class="petal" cx="1318" cy="196" rx="10" ry="6.5" transform="rotate(-24 1318 196)"/>' +
        '<ellipse class="petal" cx="1524" cy="356" rx="9" ry="6" transform="rotate(18 1524 356)"/>' +
        '<ellipse class="petal" cx="1136" cy="486" rx="8" ry="5.5" transform="rotate(40 1136 486)"/>' +
        '<ellipse class="petal" cx="1668" cy="648" rx="10" ry="6.5" transform="rotate(-12 1668 648)"/>' +
        '<ellipse class="petal" cx="892" cy="292" rx="8" ry="5.5" transform="rotate(64 892 292)"/>' +
        '<ellipse class="petal" cx="1452" cy="836" rx="9" ry="6" transform="rotate(-38 1452 836)"/>' +
        '<ellipse class="petal" cx="1256" cy="748" rx="11" ry="7" transform="rotate(28 1256 748)"/>' +
        '<ellipse class="petal" cx="1712" cy="434" rx="10" ry="6" transform="rotate(-52 1712 434)"/>' +
        '<ellipse class="petal2" cx="1042" cy="640" rx="9" ry="6" transform="rotate(16 1042 640)"/>' +
        '<ellipse class="petal2" cx="1580" cy="242" rx="8" ry="5.5" transform="rotate(-30 1580 242)"/>' +
      '</g>' +
      '<g>' +
        '<circle class="halo" cx="1696" cy="248" r="26"/><circle class="fly" cx="1696" cy="248" r="4.5"/>' +
        '<circle class="halo" cx="1552" cy="474" r="20"/><circle class="fly" cx="1552" cy="474" r="3.6"/>' +
        '<circle class="halo" cx="1788" cy="646" r="30"/><circle class="fly" cx="1788" cy="646" r="5"/>' +
        '<circle class="halo" cx="1206" cy="878" r="22"/><circle class="fly" cx="1206" cy="878" r="4"/>' +
        '<circle class="halo" cx="1668" cy="906" r="18"/><circle class="fly" cx="1668" cy="906" r="3.4"/>' +
        '<circle class="halo" cx="1398" cy="712" r="15"/><circle class="fly" cx="1398" cy="712" r="2.8"/>' +
      '</g>' +
    '</svg>';

  var SESSIONS = [
    ['春日手信 · 皮肤样板', '刚刚', true, false],
    ['灰格纹配色微调', '12 分钟', false, true],
    ['水手领装饰条', '1 小时', false, true],
    ['萤火呼吸动效', '昨天', false, false],
    ['信纸纹理试验', '2 天', false, false],
    ['樱粉点缀比重', '3 天', false, false]
  ];
  var rows = SESSIONS.map(function (s) {
    return '<div class="session' + (s[2] ? ' on' : '') + (s[3] ? ' dot' : '') + '">' +
      '<span>' + s[0] + '</span><span class="t">' + s[1] + '</span></div>';
  }).join('');

  var BOW =
    '<svg viewBox="0 0 44 26" aria-hidden="true">' +
      '<path class="loop" d="M19 13 C11 4 3 4 3 13 C3 22 11 22 19 13 Z"/>' +
      '<path class="loop" d="M25 13 C33 4 41 4 41 13 C41 22 33 22 25 13 Z"/>' +
      '<rect class="knot" x="17.5" y="8" width="9" height="10" rx="3.2"/>' +
    '</svg>';

  var CREST =
    '<svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="3.1" fill="#A9E38C"/>' +
      '<circle cx="12" cy="12" r="6.8" fill="none" stroke="#7FA85C" stroke-width="1.4" opacity=".55"/>' +
      '<path d="M5.4 6.2 9.1 10M18.6 6.2 14.9 10M5.6 18.4l3.5-4M18.4 18.4l-3.5-4" ' +
        'fill="none" stroke="#7FA85C" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>' +
    '</svg>';

  var html =
    ART_SCENE +
    /* 立绘：左大右小，压在界面之上 */
    '<img class="char left"  src="assets/character-left.webp"  alt="流萤「春日手信」立绘">' +
    '<img class="char right" src="assets/character-right.webp" alt="">' +

    '<div class="app">' +
      '<nav class="rail panel">' +
        '<div class="logo">' + svg(ICON.logo, 22) + '</div>' +
        '<div class="ico on">' + svg(ICON.chat, 19) + '</div>' +
        '<div class="ico">' + svg(ICON.plus, 19) + '</div>' +
        '<div class="ico">' + svg(ICON.search, 19) + '</div>' +
        '<div class="spacer"></div>' +
        '<div class="ico">' + svg(ICON.gear, 19) + '</div>' +
      '</nav>' +

      '<aside class="side panel">' +
        '<div class="collar">' +
          '<svg viewBox="0 0 322 82" preserveAspectRatio="none">' +
            '<path class="collar-fill" d="M0 0 H322 V82 L161 34 L0 82 Z"/>' +
            '<path class="collar-trim" d="M0 0 H322 V82 L161 34 L0 82 Z"/>' +
            '<path class="collar-stripe" d="M0 12 H322 V74 L161 26 L0 74 Z" opacity=".35"/>' +
          '</svg>' +
          '<div class="bow collar-bow">' + BOW + '</div>' +
        '</div>' +
        '<div class="side-head"><div class="newchat">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
          '新会话</div></div>' +
        '<div class="side-label">工作区<span class="tools">' +
          svg(ICON.search, 15, 2) + svg(ICON.sort, 15, 2) + '</span></div>' +
        '<div class="workspace">' + svg(ICON.folder, 15) + '<b>firefly-spring</b></div>' +
        '<div class="sessions">' + rows + '</div>' +
        '<div class="side-foot">' + svg(ICON.gear, 16) + '设置</div>' +
      '</aside>' +

      '<main class="main panel">' +
        '<div class="main-collar"></div>' +
        '<header class="topbar">' +
          '<span class="title">春日手信 · 皮肤样板</span>' +
          '<span class="chipmod">✦ 标准模式</span>' +
          '<div class="tabs"><span class="tab on">对话</span><span class="tab">轨迹</span></div>' +
          '<div class="right"><span class="btn-ghost">Session log ↓</span></div>' +
        '</header>' +
        '<section class="chat"><div class="welcome">' +
          '<div class="crest">' + CREST + '</div>' +
          '<h1>春日手信</h1>' +
          '<div class="sub">SPRING MISSIVE · 灰白水手 · 春草绿</div>' +
          '<div class="picks">' +
            '<span class="pick">🧺 工作区内修改</span>' +
            '<span class="pick">DeepSeek V4 Flash Vision Exp Max</span>' +
          '</div>' +
        '</div></section>' +
        '<div class="composer-wrap"><div class="composer">' +
          '<div class="bow composer-bow">' + BOW + '</div>' +
          '<div class="ph">描述你想要构建的内容，/ 调用指令，@ 文件或对话</div>' +
          '<div class="row">' +
            '<span class="pill plus">+</span>' +
            '<span class="pill">🧺 工作区内修改</span>' +
            '<span class="sp"></span>' +
            '<span class="pill model">DeepSeek V4 Flash Vision Exp Max</span>' +
            '<span class="send">' + svg(ICON.up, 17, 2.6) + '</span>' +
          '</div>' +
        '</div></div>' +
        '<div class="stats">' +
          '<span>0 轮 · 0 步</span><span>LLM <b>—</b></span><span>首 token <b>—</b></span>' +
          '<span>输入 <b>0 tok</b></span><span>输出 <b>0 tok</b></span>' +
        '</div>' +
      '</main>' +
    '</div>' +

    ART_WEATHER +
    '<div class="credit">立绘 © HoYoverse / miHoYo · 非商业同人自用</div>';

  document.body.insertAdjacentHTML('afterbegin', html);
})();
