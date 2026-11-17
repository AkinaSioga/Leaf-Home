---
title: 邮箱 Google Ads 投流转化
description: 通过 gclid 替换邮箱，识别客户是自然流还是 Google Ads 来的，以及来自哪个广告系列。
publishedAt: 2026-11-17
category: 技术
tags:
  - Google Ads
  - 投流
draft: false
---

Customer 通过 Google Ads 进入的时候，Url 会带有 `gclid` 标签。

此时可以通过获取 `gclid` 的 param 参数来制作 JS 脚本，通过 Cookies / localStorage 持久化识别返客，有效期靠 `expires` 或者 `MaxAge` 来维持。

if 识别到 param 参数，就让脚本把 info@ 邮箱替换为如 quotes@ 邮箱。

这样就可以有效地避免并识别到此客户是否自然流 / Google Ads 来的，并直接复制黏贴邮箱（而不是点击 `mailto:`）来的。

```html
<!-- 需要动态替换的邮箱链接，加上 data-contact-email -->
<a data-contact-email href="mailto:info@example.com">
  info@example.com
</a>

<script>
  const params = new URLSearchParams(window.location.search);
  let fromGoogleAds = Boolean(params.get("gclid"));

  try {
    if (fromGoogleAds) {
      sessionStorage.setItem("from_google_ads", "1");
    }

    fromGoogleAds =
      fromGoogleAds ||
      sessionStorage.getItem("from_google_ads") === "1";
  } catch (error) {
    // 存储被禁用时，当前页仍可按 gclid 替换，但无法跨页记忆。
    console.warn(
      "无法保存广告来源，跨页邮箱替换不可用。",
      error
    );
  }

  if (fromGoogleAds) {
    document
      .querySelectorAll("[data-contact-email]")
      .forEach(link => {
        link.textContent = "quotes@example.com";
        link.href = "mailto:quotes@example.com";
      });
  }
</script>
```

同时也可以通过配置 Google Ads，在：

**管理（Admin） → 账户设置（Account settings） → 跟踪模板（Tracking template） → 最终到达网址后缀（Final URL suffix）**

添加：

```text
campaign_id={campaignid}&ad_id={creative}
```

并且在网页代码下配置：

```javascript
const params = new URLSearchParams(window.location.search);

const campaignId = params.get("campaign_id");
const adId = params.get("ad_id");
const gclid = params.get("gclid");
```

来获取广告系列以及广告 ID，来进一步识别 customer 是从哪个广告系列来的（针对多广告投流单网址时）。
