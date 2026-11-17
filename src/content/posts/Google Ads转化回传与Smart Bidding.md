---
title: Google Ads 转化回传与 Smart Bidding
description: 通过 CRM 或 Google Sheets 来定性邮件，反向优化 Google Ads 的学习，以及 mailto 和复制邮箱的监听。
publishedAt: 2026-11-17
category: 技术
tags:
  - 投流
  - Google Ads
draft: false
---

在面对统计转化时直接的应该是 quote 和 `mailto:` 这两个直接的按钮。

针对 quotes，这时候 google 会统计 conversions 但不清楚是否是有效的 conversions，会对 smart bidding 造成一定的影响。

这时候我们可以通过邮箱的 CRM（如 zoho CRM）绑定 google ads 或者连接到 Zoho Flow 的 plugins，这样在来询盘的时候可以在 CRM 或者 google sheets（如果不想用 CRM 或者 Zoho flow 这个中间件）来定性邮件，是否成交来反向优化 google ads 的学习，清洗掉噪音，进而正向提高 smart bidding 的算法。

至于 `mailto:`，可以参考[第一篇文章《邮箱 Google Ads 投流转化》](../邮箱google-ads投流转化/)。

另关于 mailto 再补充两点，由于这种 gclid 只针对回传而不针对优化，所以还是得在 ga4 加个 copy event 监听以及 mailto 的 get gclid，这样才能优化算法。

mailto 的直接点击可以通过静默 webhook 生成一个短码，并根据“短码 <-> 完整 GCLID”的对应关系存进 CRM 或者 google sheet 上，但是还得注意网站是否用了 **AJAX / Fetch 动态加载**。

```html
<script>
(function () {
  'use strict';

  // ==============================
  // 1. 配置
  // ==============================
  var defaultEmail = 'info@yourcompany.com';
  var adsEmail = 'quotes@yourcompany.com';

  var STORAGE_KEY = 'b2b_stored_gclid';
  var STORAGE_TIME_KEY = 'b2b_gclid_timestamp';
  var STORAGE_DURATION = 90 * 24 * 60 * 60 * 1000;

  // ==============================
  // 2. 获取并保存 GCLID
  // ==============================
  var urlParams = new URLSearchParams(window.location.search);
  var gclidFromUrl = urlParams.get('gclid');

  try {
    if (gclidFromUrl) {
      localStorage.setItem(STORAGE_KEY, gclidFromUrl);
      localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
    }
  } catch (e) {
    console.warn('[Attribution] LocalStorage unavailable');
  }

  var savedGclid = null;

  try {
    var storedGclid = localStorage.getItem(STORAGE_KEY);
    var storedTime = Number(localStorage.getItem(STORAGE_TIME_KEY));

    if (
      storedGclid &&
      storedTime &&
      Date.now() - storedTime < STORAGE_DURATION
    ) {
      savedGclid = storedGclid;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIME_KEY);
    }
  } catch (e) {
    console.warn('[Attribution] Unable to read GCLID');
  }

  // 自然流量不执行广告邮箱替换
  if (!savedGclid) return;

  // ==============================
  // 3. 安全替换纯文本邮箱
  // ==============================
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var emailRegex = new RegExp(
    escapeRegExp(defaultEmail),
    'gi'
  );

  function swapEmailForAdsTraffic() {

    // A. 仅修改原本指向 info@ 的 mailto 链接
    var mailLinks = document.querySelectorAll(
      'a[href^="mailto:"]'
    );

    mailLinks.forEach(function (link) {

      var originalHref = link.getAttribute('href');

      if (
        !new RegExp(
          '^mailto:' + escapeRegExp(defaultEmail) + '(?:[?#]|$)',
          'i'
        ).test(originalHref)
      ) {
        return;
      }

      // 只替换文本，不重建整个 HTML
      if (link.textContent.toLowerCase().indexOf(
        defaultEmail.toLowerCase()
      ) !== -1) {
        link.textContent = link.textContent.replace(
          emailRegex,
          adsEmail
        );
      }

      // 暂时只保留邮件主题，不暴露完整 GCLID
      var subject = encodeURIComponent(
        'RFQ Inquiry / Quote Request'
      );

      link.setAttribute(
        'href',
        'mailto:' + adsEmail + '?subject=' + subject
      );
    });

    // B. 替换纯文本邮箱
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var parent = node.parentElement;

          if (!parent) return NodeFilter.FILTER_REJECT;

          if (
            /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/i.test(
              parent.tagName
            ) ||
            parent.isContentEditable
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return node.nodeValue.toLowerCase().indexOf(
            defaultEmail.toLowerCase()
          ) !== -1
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    var node;

    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue.replace(
        emailRegex,
        adsEmail
      );
    }
  }

  // ==============================
  // 4. 监听复制邮箱行为
  // ==============================
  document.addEventListener('copy', function () {

    var selectedText = window.getSelection()
      .toString()
      .trim();

    if (
      selectedText.toLowerCase().indexOf(
        adsEmail.toLowerCase()
      ) === -1
    ) {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: 'ads_email_copied',
      copied_email: adsEmail,
      gclid: savedGclid
    });

  });

  // ==============================
  // 5. DOM 加载
  // ==============================
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      swapEmailForAdsTraffic
    );
  } else {
    swapEmailForAdsTraffic();
  }

})();
</script>
```
