import { registerVisitor } from '../db.js';
import { parseBody, sendJson } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const body = await parseBody(req);
    const { visitorId, variant } = body;

    if (!visitorId || !variant) {
      return sendJson(res, 400, { error: 'visitorId and variant required.' });
    }

    const visitor = await registerVisitor({ visitorId, variant });
    return sendJson(res, 200, { success: true, visitor });
  } catch (err) {
    console.error('API Error in POST /api/analytics/visitor:', err);
    return sendJson(res, 500, { error: 'Failed to register visitor.' });
  }
}

