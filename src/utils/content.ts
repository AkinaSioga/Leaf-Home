import { getCollection, type CollectionEntry } from 'astro:content';
import { withBasePath } from './url';

// 草稿预览仅在构建端启用，正式构建不会生成草稿页面。
export const previewContent = import.meta.env.CONTENT_PREVIEW === 'true';
export const visible = ({ data }: { data: { draft: boolean } }) => previewContent || !data.draft;
export const dated = (date: Date) => date.toLocaleDateString('zh-CN', { timeZone: 'UTC' });
const segments = (id: string) => id.split('/').map(encodeURIComponent).join('/');
export const postUrl = (id: string) => withBasePath(`/posts/${segments(id)}/`);
export const seriesUrl = (id: string) => withBasePath(`/writing/series/${segments(id)}/`);
export const chapterUrl = (id: string) => withBasePath(`/writing/chapters/${segments(id)}/`);
export const essayUrl = (id: string) => withBasePath(`/writing/essays/${segments(id)}/`);
export const taxonomyUrl = (kind: 'categories' | 'tags', name: string) => withBasePath(`/${kind}/${encodeURIComponent(name)}/`);
export const statusLabel = { serializing: '正在连载', completed: '已完结', paused: '暂歇' } as const;
// IDs are identifiers: use the same tie-break on Windows and on the Pages runner.
function compareIds(a: { id: string }, b: { id: string }) {
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}
export const newest = <T extends { id: string; data: { publishedAt: Date } }>(a: T, b: T) =>
  b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || compareIds(a, b);
export const getPosts = async () => (await getCollection('posts', visible)).sort(newest);

export async function getWriting() {
  const [allSeries, allChapters, allEssays] = await Promise.all([
    getCollection('series'), getCollection('chapters'), getCollection('essays'),
  ]);
  const seriesIds = new Set(allSeries.map(work => work.id));
  const orders = new Set<string>();
  for (const chapter of allChapters) {
    if (!seriesIds.has(chapter.data.series)) {
      throw new Error(`章节 ${chapter.id} 指向不存在的作品：${chapter.data.series}`);
    }
    const key = `${chapter.data.series}:${chapter.data.order}`;
    if (orders.has(key)) throw new Error(`作品 ${chapter.data.series} 存在重复章节序号 ${chapter.data.order}`);
    orders.add(key);
  }
  const works = allSeries.filter(visible);
  const visibleIds = new Set(works.map(work => work.id));
  const chapters = allChapters.filter(chapter => visible(chapter) && visibleIds.has(chapter.data.series))
    .sort((a, b) => a.data.order - b.data.order);
  const chaptersFor = (id: string) => chapters.filter(chapter => chapter.data.series === id);
  const updated = (work: CollectionEntry<'series'>) => Math.max(
    (work.data.updatedAt ?? work.data.publishedAt).getTime(),
    ...chaptersFor(work.id).map(chapter => (chapter.data.updatedAt ?? chapter.data.publishedAt).getTime()),
  );
  works.sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || updated(b) - updated(a) || compareIds(a, b));
  return { works, chapters, chaptersFor, essays: allEssays.filter(visible).sort(newest) };
}
