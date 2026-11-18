import type { CollectionEntry } from 'astro:content';

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
