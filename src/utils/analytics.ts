export type ABVariant = 'A' | 'B';

export const HERO_VARIANTS: Record<ABVariant, string> = {
  A: 'I build products. Now I want to help people discover them.',
  B: '4 products built. 2 internships. Now I want to grow products, not just build them.',
};

const VISITOR_ID_KEY = 'rt_growth_visitor_id';
const VARIANT_KEY = 'rt_growth_ab_variant';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'usr_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function initVisitor(): { visitorId: string; variant: ABVariant } {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  let variant = localStorage.getItem(VARIANT_KEY) as ABVariant | null;

  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  if (!variant || (variant !== 'A' && variant !== 'B')) {
    // 50/50 Random split
    variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(VARIANT_KEY, variant);
  }

  // Register in backend
  fetch('/api/analytics/visitor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId, variant }),
  }).catch((err) => {
    console.debug('Analytics visitor init error:', err);
  });

  return { visitorId, variant };
}

let lastTrackTime = 0;
let highestDepthReported = 0;

export function trackScrollProgress(
  visitorId: string,
  scrollProgress: number,
  stage: string | null = null
) {
  const depth = Math.round(scrollProgress * 100);
  const now = Date.now();

  // Only report if depth increased significantly or every 2 seconds
  if (depth > highestDepthReported + 4 || (now - lastTrackTime > 2500 && depth > highestDepthReported)) {
    highestDepthReported = Math.max(highestDepthReported, depth);
    lastTrackTime = now;

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        scrollDepth: depth,
        stage,
      }),
    }).catch(() => {});
  }
}

export function trackContactReached(visitorId: string) {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId,
      reachedContact: true,
    }),
  }).catch(() => {});
}

