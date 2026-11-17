---
title: Cloudflare Workers 中转阿里云 API
description: 在国内阿里云接取国外 API 遇到 timed out 时，通过 Cloudflare Workers 中转承接。
publishedAt: 2026-11-17
category: 技术
tags:
  - astrbot
  - aliyun
  - cloudflare
draft: false
---

在部署国内阿里云的时候，直接接取 CS2 的 API 或者国外站的 API 常常会 timed out，可以使用 Cloudflare Worker 作为中转承接。

也就是：

```text
Aliyun > Cloudflare Workers > 目标接口
```

某些极端时候（比如说没有 API，或者说是需要执行 JS 才能显示的画面），也可以让 Cloudflare 来调用 browse use 来实时获取页面信息。

但是注意一下，[免费方案每日仅有 10 分钟的额度](https://developers.cloudflare.com/browser-run/pricing/)。
