# 写文章与故事

首页的正式文章放在 `src/content/posts/`，创作区的连载与散文独立收录，不会混入首页分类、标签和日历。

## 本地查看

在项目目录运行：

```powershell
pnpm preview:drafts
```

打开 http://127.0.0.1:4323/ 。该命令先构建，再预览所有草稿；页面顶部有预览提示，带 noindex。修改 Markdown 后按 Ctrl+C 停止，再运行一次。正式内容可用 `pnpm build` 后 `pnpm preview --host 127.0.0.1 --port 4322` 检查。

草稿构建写入 `dist-drafts/`，正式构建写入 `dist/`；不要将草稿构建上传。正式构建默认排除所有 `draft: true` 内容。创作内容未填写 draft 时也按草稿处理。日期仅用于显示和排序，不提供定时发布。

## 连载作品

1. 复制 `src/content/series/night-letters.md`，例如命名为 `my-story.md`。
2. 修改书名、简介、摘句、日期和状态。保留 `draft: true` 先预览。
3. 新建 `src/content/chapters/my-story/` 文件夹，将示例章节复制进去，修改 `series: my-story`。
4. 每章填写唯一的正整数 `order`，目录与上下章按该值排序，与文件名、发布日期无关。
5. 准备发布时，作品文件和准备公开的章节都改为 `draft: false`。作品仍为草稿时，其全部章节均不会出现在正式构建。

作品文件头：

```yaml
---
title: 我的故事
description: 一句话介绍这个故事。
publishedAt: 2026-11-16
status: serializing
excerpt: 想留在首页的一句话。
featured: false
draft: true
---
这里可以写更长的作品介绍，会显示在目录上方。
```

状态：`serializing` 连载中、`completed` 已完结、`paused` 暂歇。`featured: true` 优先展示为创作首页大图作品；同优先级按作品和已显示章节的最新日期排序。其余作品列在“更多故事”。

章节文件头：

```yaml
---
title: 第一缕光
series: my-story
order: 1
publishedAt: 2026-11-16
draft: true
---
直接在这里写正文。段落之间空一行，不需要再写一遍标题。
```

`series` 是作品文件名去掉 .md；若作品在子文件夹中则包含路径，例如 `long/my-story`。章节路径也可以分文件夹。重复序号或不存在的作品会使构建报错，并指出文件，避免悄悄漏章。“最新章节”指阅读顺序最后一章。

## 独立散文

复制 `src/content/essays/window-rain.md` 改名，填写：

```yaml
---
title: 我的散文
description: 在散文列表显示的一两句话。
publishedAt: 2026-11-16
draft: true
---
散文正文。
```

散文按发布日期从新到旧排列；准备好后改为 `draft: false`。

## 正式文章 / 随笔

复制 `src/content/posts/hello-world.md` 改名，填写 title、description、publishedAt、category、tags 和 `draft: true`，正文直接写 Markdown。发布时设 `draft: false`。首页分类、标签、日历以及文章详情自动生成。

分类和标签可用中文，避免使用斜杠。文章、作品和散文的文件名建议用小写英文与短横线；文件路径决定链接，发布后改名会使原链接失效。可选 `updatedAt: 2026-11-17` 显示修订日期。

项目中的《夜航来信》两章和《把雨声留在窗外》仅为排版示例，全部默认草稿。正式创作区尚无内容时会显示留白页；写好第一篇后自然替换。

## Markdown 与发布

支持段落、标题、粗体、引用、列表、链接、代码块、表格与图片。图片可放在 Markdown 相邻文件夹，通过相对路径引用，例如 `![窗外](./images/window.jpg)`；Astro 会处理本地图片路径。

发布前运行 `pnpm astro check` 和 `pnpm build`。本次只完成本地实现；提交 main 会触发既有部署流程，部署与旧站切换需另行确认。
