/** Append only archive filters to a clean local page path. */
export function withPostFilters(path: string, category = '', tag = ''): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (tag) params.set('tag', tag);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export function withBasePath(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  if (path === '/') return base;

  return `${base}${path.replace(/^\/+/, '')}`;
}
