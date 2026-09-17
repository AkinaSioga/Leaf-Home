export type NavBarLink = {
  name: string;
  href: string;
  external?: boolean;
  icon?: string;
  children?: NavBarLink[];
  pageKey?: string;
};

export type NavBarConfig = {
  links: NavBarLink[];
};