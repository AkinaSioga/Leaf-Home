const serviceDay = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai' });
const shortNumber = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });

function parseCount(value: unknown): number {
  const count = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
    throw new Error('访客计数无效');
  }
  return count;
}

function initPendant(widget: HTMLElement) {
  const readings = widget.querySelector<HTMLElement>('.visitor-readings')!;
  const today = readings.querySelector<HTMLElement>('[data-visitors-today]')!;
  const total = readings.querySelector<HTMLElement>('[data-visitors-total]')!;
  const clock = widget.querySelector<HTMLTimeElement>('[data-visitor-clock]')!;
  const countVisits = widget.dataset.countOrigin === location.origin;
  const description = countVisits ? '不蒜子独立访客统计' : '预览页面不计入访客统计';
  readings.title = description;
  let requestedDay = '';
  let retryOnReturn = false;
  let minuteTimer = 0;

  function showCount(element: HTMLElement, count: number) {
    element.textContent = count < 10_000 ? String(count) : shortNumber.format(count);
    element.title = String(count);
    element.setAttribute('aria-label', String(count));
  }

  async function loadVisitors(day: string) {
    requestedDay = day;
    retryOnReturn = false;
    readings.setAttribute('aria-busy', 'true');
    try {
      // Group all pages under the site root. Only the UV fields are displayed.
      const response = await fetch('https://cdn.busuanzi.cc/api.php', {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'origin',
        body: JSON.stringify({ url: location.origin + '/', referrer: '' }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`访客统计 HTTP ${response.status}`);
      const result = await response.json();
      const dailyVisitors = parseCount(result.busuanzi_today_uv);
      const totalVisitors = parseCount(result.busuanzi_site_uv);
      if (requestedDay !== day) return;
      showCount(today, dailyVisitors);
      showCount(total, totalVisitors);
      readings.title = description;
    } catch {
      if (requestedDay !== day) return;
      retryOnReturn = true;
      readings.title = '访客统计暂不可用';
      for (const value of [today, total]) {
        value.textContent = '—';
        value.removeAttribute('title');
        value.setAttribute('aria-label', '暂不可用');
      }
    } finally {
      if (requestedDay === day) readings.removeAttribute('aria-busy');
    }
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
