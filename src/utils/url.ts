export function withBasePath(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  if (path === '/') return base;

  return `${base}${path.replace(/^\/+/, '')}`;
}
