# 975 圆体网页字体

来源：[lxgw/975Yuan](https://github.com/lxgw/975Yuan)，固定版本 `37b753f408b25d3ab3d25cbddb5dd9dacca0289a`。

使用官方 `TTF/LXGW975YuanSC-500W.ttf` 与 `TTF/LXGW975YuanSC-700W.ttf`，仅子集化、转换为 WOFF2 网页字体，未修改字形。500W 用于正文，700W 用于标题及强调文字；CSS 将相近字重映射到这两个静态字体。所有页面本地加载，`font-display: swap` 保持字体加载期间可阅读。

当前站内文字放在 `core` 文件，其余字符按 Unicode 区间拆分，通过 `unicode-range` 按需加载。保留官方字体完整字符覆盖，新增文章无需重新生成字体。生成的 CSS 在 `src/styles/fonts.css`；请通过脚本更新，勿手动改动字符范围。

按随附 [OFL.txt](../../../../public/fonts/975yuan/OFL.txt) 的 SIL Open Font License 1.1 及网页格式转换附加许可使用，字体保留原版权信息。许可文件随网站一起发布至 `fonts/975yuan/OFL.txt`。本目录字体仅供网页渲染。

转换环境：Python 3、fontTools 4.68.0、Brotli 1.2.1。复现：在单独的 Python 环境安装 `fonttools[woff]`，将上述固定版本的官方 TTF 放入一个目录，然后执行 `python scripts/prepare-fonts.py <TTF目录>`。本次转换工具临时安装在忽略目录 `outputs/font-tools`，不加入网站依赖，也不参与常规构建。
