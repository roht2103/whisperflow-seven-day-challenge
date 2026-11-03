import submissionsHandler from './submissions.js';
import visitorHandler from './analytics/visitor.js';
import trackHandler from './analytics/track.js';
import resultsHandler from './analytics/results.js';
import { sendJson } from './_utils.js';

export default async function handler(req, res) {
  const url = req.url ? req.url.split('?')[0] : '';

  // Route to the appropriate sub-handler
  if (url === '/api/submissions' || url.endsWith('/submissions')) {
    return submissionsHandler(req, res);
  }

  if (url === '/api/analytics/visitor' || url.endsWith('/analytics/visitor')) {
    return visitorHandler(req, res);
  }

  if (url === '/api/analytics/track' || url.endsWith('/analytics/track')) {
    return trackHandler(req, res);
  }

  if (url === '/api/analytics/results' || url.endsWith('/analytics/results')) {
    return resultsHandler(req, res);
  }

  return sendJson(res, 404, { error: 'API route not found' });
}

