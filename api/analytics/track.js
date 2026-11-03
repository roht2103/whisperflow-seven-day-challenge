import { updateTracking } from '../db.js';
import { parseBody, sendJson } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await parseBody(req);
    const { visitorId, scrollDepth, stage, reachedContact } = body;

    if (!visitorId) {
      return sendJson(res, 400, { error: 'visitorId required.' });
    }

    await updateTracking({ visitorId, scrollDepth, stage, reachedContact });
    return sendJson(res, 200, { success: true });
  } catch (err) {
    console.error('API Error in POST /api/analytics/track:', err);
    return sendJson(res, 500, { error: 'Failed to update tracking.' });
  }
}

