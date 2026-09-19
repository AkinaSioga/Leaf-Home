export interface NowItem {
  text: string;
  status: 'ongoing' | 'done' | 'planned';
}

export interface ShortNote {
  date: string; // YYYY-MM-DD，按日期降序显示最近三条。
  text: string;
}

export interface Bookmark {
  title: string;
  url: string; // 完整的 https:// 或 http:// 地址。
  description: string;
}

// 修改这里即可更新三个小组件；不需要改动页面模板。
export const personalConfig: {
  now: { updatedAt: string; items: NowItem[] };
  notes: ShortNote[];
  bookmarks: Bookmark[];
} = {
  now: {
    updatedAt: '2026-09-17',
    items: [
      { text: '给博客添一点个人日常', status: 'ongoing' },
      { text: '整理博客第一版，创建 PR', status: 'done' },
    ],
  },
  notes: [
    { date: '2026-09-17', text: '找回了之前的博客项目，第一版已经放进 GitHub PR。小屋继续慢慢搭。' },
  ],
  bookmarks: [],
};
