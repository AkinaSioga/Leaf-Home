const serviceDay = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' });
const shortNumber = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });

function parseCount(value: unknown): number | null {
  const count = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  return typeof count === 'number' && Number.isSafeInteger(count) && count >= 0 ? count : null;
}

interface VisitCounts {
  busuanzi_today_uv?: unknown;
  busuanzi_site_uv?: unknown;
  busuanzi_page_pv?: unknown;
}

async function recordVisit(postKey?: string): Promise<VisitCounts | null> {
  const path = postKey ? `/_views/${postKey}` : '/';
  try {
    const response = await fetch('https://cdn.busuanzi.cc/api.php', {
      method: 'POST',
      credentials: 'omit',
      referrerPolicy: 'origin',
      body: JSON.stringify({ url: location.origin + path, referrer: '' }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    // The UI distinguishes an unavailable counter from a confirmed zero.
    return null;
  }
}

function initPendant(widget: HTMLElement) {
  const readings = widget.querySelector<HTMLElement>('.visitor-readings')!;
  const today = readings.querySelector<HTMLElement>('[data-visitors-today]')!;
  const total = readings.querySelector<HTMLElement>('[data-visitors-total]')!;
  const clock = widget.querySelector<HTMLTimeElement>('[data-visitor-clock]')!;
  const countVisits = widget.dataset.countOrigin === location.origin;
  const postViews = document.querySelector<HTMLElement>('[data-post-view-key]');
  let pendingPostKey = postViews?.dataset.postViewKey;
  if (postViews && !countVisits) postViews.title = '预览页面不计入阅读量';
  const description = countVisits ? '不蒜子独立访客统计' : '预览页面不计入访客统计';
  readings.title = description;
  let requestedDay = '';
  let retryOnReturn = false;
  let minuteTimer = 0;

  function showCount(element: HTMLElement, count: number | null) {
    if (count === null) {
      element.textContent = '—';
      element.title = '统计暂不可用';
      element.setAttribute('aria-label', '暂不可用');
      return;
    }
    element.textContent = count < 10_000 ? String(count) : shortNumber.format(count);
    element.title = String(count);
    element.setAttribute('aria-label', String(count));
  }

  async function loadVisitors(day: string) {
    requestedDay = day;
    retryOnReturn = false;
    readings.setAttribute('aria-busy', 'true');
    const online = navigator.onLine;
    const postKey = pendingPostKey;
    // A timed-out POST may already have incremented PV. Retries and midnight
    // updates use the site root. If offline, keep the first hit for reconnection.
    if (online) pendingPostKey = undefined;
    const result = online ? await recordVisit(postKey) : null;
    if (postKey && postViews) showCount(postViews, parseCount(result?.busuanzi_page_pv));

    if (requestedDay !== day) return;
    const dailyVisitors = parseCount(result?.busuanzi_today_uv);
    const totalVisitors = parseCount(result?.busuanzi_site_uv);
    showCount(today, dailyVisitors);
    showCount(total, totalVisitors);
    retryOnReturn = dailyVisitors === null || totalVisitors === null;
    readings.title = retryOnReturn ? '访客统计暂不可用' : description;
    readings.removeAttribute('aria-busy');
  }

  function tick() {
    window.clearTimeout(minuteTimer);
    if (document.hidden) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clock.dateTime = `${hours}:${minutes}`;
    clock.textContent = `${hours} : ${minutes}`;
    if (countVisits) {
      const day = serviceDay.format(now);
      if (requestedDay !== day) void loadVisitors(day);
    }
    minuteTimer = window.setTimeout(tick, 60_000 - now.getTime() % 60_000);
  }

  function resume() {
    if (!document.hidden && retryOnReturn) requestedDay = '';
    tick();
  }
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pageshow', resume);
  window.addEventListener('online', resume);
  tick();
}

const widget = document.querySelector<HTMLElement>('[data-visitor-widget]');
if (widget) initPendant(widget);
