import { getAnalyticsResults } from '../db.js';
import { sendJson } from '../_utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const results = await getAnalyticsResults();
    return sendJson(res, 200, { success: true, results });
  } catch (err) {
    console.error('API Error in GET /api/analytics/results:', err);
    return sendJson(res, 500, { error: 'Failed to retrieve results.' });
  }
}

