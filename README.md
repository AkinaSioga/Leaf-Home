# Leaf-Home
Astro Blog

## 部署

`main` 分支更新后由 GitHub Actions 检查、构建并发布到 `https://akinasuki.love`。
部署配置和旧站回退步骤见 [部署说明](docs/deployment.md)。

## 更新个人小组件

编辑 `src/config/personal.ts` 即可更新首页内容，修改后重新构建：

- `now`：最近在折腾。`updatedAt` 为更新时间，`items` 中的 `status` 可填 `ongoing`（进行中）、`done`（已完成）、`planned`（想做）。
- `notes`：碎碎念。每条填写 `date`（`YYYY-MM-DD`）和 `text`，首页按日期降序显示最近三条。
- `bookmarks`：小书签。每条填写 `title`、完整 HTTP(S) 地址 `url` 和推荐理由 `description`；留空时显示空状态。链接在当前标签页打开。

三个组件均在构建期生成，无需客户端 JavaScript。初始动态来自博客项目的实际进展，书签暂未填写。









## 致谢 / 参考项目

本项目在设计思路和部分实现方式上参考了以下开源项目：

- [FireFly](github.com/CuteLeaf/Firefly/) by [CuteLeaf]

感谢原作者的开源分享。
