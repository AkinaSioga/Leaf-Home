import type { CollectionEntry } from 'astro:content';

export function estimateReadingMinutes(body = '') {
  const prose = body
    .replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[ \t]*\r?$/gm, '')
    .replace(/!?\[([^\]]*)\]\([^\n)]*\)/g, '$1');
  const han = prose.match(/\p{Script=Han}/gu)?.length ?? 0;
  const words = prose.match(/[a-z]+(?:['’-][a-z]+)*/gi)?.length ?? 0;
  return Math.max(1, Math.ceil(han / 450 + words / 220));
}

export interface TagGroup {
  total: number;
  tags: Map<string, number>;
}

function emptyGroup(): TagGroup {
  return { total: 0, tags: new Map() };
}

export function buildPostStats(posts: readonly CollectionEntry<'posts'>[]) {
  const all = emptyGroup();
  const categories = new Map<string, TagGroup>();
  for (const { data: { category, tags } } of posts) {
    let branch = categories.get(category);
    if (!branch) {
      branch = emptyGroup();
      categories.set(category, branch);
    }
    // The content schema guarantees one occurrence of each tag per post.
    for (const group of [all, branch]) {
      group.total++;
      for (const tag of tags) group.tags.set(tag, (group.tags.get(tag) ?? 0) + 1);
    }
  }
  const totals = { posts: all.total, categories: categories.size, tags: all.tags.size };
  return { all, categories, totals };
}

export type PostStats = ReturnType<typeof buildPostStats>;
