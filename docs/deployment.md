# akinasuki.love 部署与回退

Leaf-Home 使用 GitHub Actions 构建 Astro，`main` 更新或手动运行
`Deploy Astro site to Pages` 后发布 `dist`。Node 版本与本地验收一致，
pnpm 版本取自 `package.json`。构建前执行类型检查和图标一致性检查。

正式地址为 `https://akinasuki.love`，`SITE_URL` 使用该地址，`BASE_PATH=/`。
GitHub Pages 的 Source 设置为 GitHub Actions，Custom domain 为 `akinasuki.love`。

## 2026-09-19 切换前记录

- 旧仓库：`AkinaSioga/Game-Blog`，保留源码和历史，不删除仓库。
- 旧 Pages：workflow 模式，source 为 `main` 的 `/`，自定义域名 `akinasuki.love`。
- 旧工作流：`.github/workflows/hugo.yaml`（ID `291347086`），切换前为 active。
- 切换前开启 HTTPS 强制跳转，但 GitHub 报告原证书已于 2026-09-06 到期，状态为 `bad_authz`。
- 用户明确要求直接切换域名，覆盖 AGENT.md 中先使用临时地址验收的步骤；仍保留本地构建检查及回退途径。

## 回退步骤

1. 暂停 Leaf-Home 的部署工作流，移除其 Pages Custom domain。
2. 在 Game-Blog 的 Pages 中重新绑定 `akinasuki.love`，保持 GitHub Actions 模式。
3. 启用 Game-Blog 的 `Deploy Hugo site to Pages` 工作流，手动运行。
4. 检查部署、域名 DNS 检查和证书状态；证书恢复后开启 Enforce HTTPS。

移交域名本身不需要更换同一 GitHub 账号的 Pages DNS 目标。如 DNS 健康检查失败，
应核对域名服务商的实际记录后处理，不使用本地代理返回的虚拟 IP 地址配置 DNS。
