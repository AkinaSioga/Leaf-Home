import type { CollectionEntry } from 'astro:content';
import { postUrl } from './content';

interface CalendarMonth {
  days: Record<number, { title: string; url: string }[]>;
  bands: [number, number, number, number];
}

export type CalendarIndex = Record<number, Record<number, CalendarMonth>>;

export function buildPostCalendar(posts: readonly CollectionEntry<'posts'>[]): CalendarIndex {
  const index: CalendarIndex = {};
  for (const post of posts) {
    const date = post.data.publishedAt;
    const year = index[date.getUTCFullYear()] ??= {};
    const month = year[date.getUTCMonth()] ??= { days: {}, bands: [0, 0, 0, 0] };
    const day = date.getUTCDate();
    (month.days[day] ??= []).push({ title: post.data.title, url: postUrl(post.id) });
    // The fourth band includes the 29th through the end of the month.
    month.bands[Math.min(Math.floor((day - 1) / 7), 3)]++;
  }
  return index;
}
