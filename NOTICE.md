# 第三方素材声明 / Third-Party Asset Notice

## 人物立绘

```
assets/character-left.webp
assets/character-right.webp
```

- **原作 / 版权方**：© HoYoverse / miHoYo
- **角色**：流萤（Firefly）—《崩坏：星穹铁道》
- **时装**：春日手信（Spring Missive），3.4 版本
- **素材来源**：[skowt.cc](https://skowt.cc/) 官方素材库，
  条目 *"Spring Missive outfit - Firefly"* 与 *"Spring Missive outfit (Portrait) - Firefly"*
- **来源页面的授权说明**：

  > Non-commercial fan creations allowed under the official Fan Creations Guide
  > with attribution; commercial use needs permission. © HoYoverse / miHoYo

  （按官方同人指引允许非商业同人创作，需署名；商业使用需获得许可。）

### 使用范围

这套皮肤**仅限个人、非商业的同人用途**：

- ✅ 自己电脑上用、改、二次创作
- ✅ 非商业地分享（保留本声明与署名）
- ❌ 任何商业用途（售卖、付费墙、广告变现、打包进付费产品）
- ❌ 声称这些立绘是你自己的作品
- ❌ 把 `assets/` 里的立绘单独抽出来当作素材库再分发

若版权方提出要求，请立即移除 `assets/` 下的文件。

## 如何移除第三方素材

本仓库的设计是：**立绘是可选层**，删掉之后皮肤仍然完整可用（会只剩原创的背景、
面板与装饰，人物位置留空）。

```bash
# 直接从仓库里删掉立绘
git rm -r assets/
git commit -m "Remove third-party character art"
git push
```

删掉之后如果想放自己的图：

1. 把你的透明底立绘放到 `assets/character-left.webp`
   和 `assets/character-right.webp`；
2. 在 `skin.css` 里给 `.char` 加个 `background: none` 不必要 —— 图片缺失时
   `<img>` 只会显示不出来，不会报错；
3. 顺手把 `index.html` / `README.md` 右下角的署名行改掉或删掉。

也可以把立绘换成任何非版权图片（自己的画、CC0 素材、AI 生成的原创图），
那样整个仓库就完全没有第三方素材了。

## 原创部分

以下内容为本项目原创，按仓库根目录的 [LICENSE](LICENSE)（MIT）授权：

- `skin.css` —— 全部样式与设计令牌
- `skin.js` —— 界面标记，以及 `ART_SCENE`（拱窗 / 窗台花箱 / 光束 / 垂藤 / 地面）、
  装饰 SVG（春枝、信封火漆印、水手领、蝴蝶结）、花瓣与萤火层
- `tokens.css`、`index.html`
- `preview/` 下的渲染图（其中包含上面的第三方立绘，因此同样受本声明的约束）
