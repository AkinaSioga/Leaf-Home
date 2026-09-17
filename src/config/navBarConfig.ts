import type { NavBarConfig } from "../types/navBarConfig";

export const navBarConfig: NavBarConfig = {
  links: [
    {
      name: "首页",
      href: "/",
      icon: "material-symbols:home-rounded",
    },
    {
      name: "文章",
      href: "/#articles",
      icon: "material-symbols:folder-open-rounded",
    },
    {
      name: "关于",
      href: "/about",
      icon: "material-symbols:person-rounded",
    },
    {
      name: "链接",
      href: "/#links",
      icon: "material-symbols:link-rounded",
    },
  ],
};