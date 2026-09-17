import type { CollectionEntry } from 'astro:content';

type PostEntry = CollectionEntry<'posts'>;

export function buildTaxonomyCounts(posts: readonly PostEntry[]) {
  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    categoryCounts.set(
      post.data.category,
      (categoryCounts.get(post.data.category) ?? 0) + 1,
    );

    for (const tag of post.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return { categoryCounts, tagCounts };
}
