import {
  saveSubmission,
  getSubmissions,
  registerVisitor,
  updateTracking,
  getAnalyticsResults,
} from './db.js';

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function funnelApiPlugin() {
  return {
    name: 'funnel-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // 1. POST /api/submissions
        if (url === '/api/submissions' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const { name, email, company, message, visitorId } = body;

            if (!name || !email || !company || !message) {
              sendJson(res, 400, {
                error: 'All fields (name, email, company, message) are required.',
              });
              return;
            }

            const submission = saveSubmission({
              name,
              email,
              company,
              message,
              visitorId,
            });
            sendJson(res, 201, {
              success: true,
              submission,
              message: 'Thank you for reaching out! Your submission has been saved.',
            });
          } catch (err) {
            console.error('API Error in /api/submissions:', err);
            sendJson(res, 500, { error: 'Failed to save submission.' });
          }
          return;
        }

        // 2. GET /api/submissions
        if (url === '/api/submissions' && req.method === 'GET') {
          try {
            const list = getSubmissions();
            sendJson(res, 200, { success: true, submissions: list });
          } catch (err) {
            console.error('API Error in GET /api/submissions:', err);
            sendJson(res, 500, { error: 'Failed to retrieve submissions.' });
          }
          return;
        }

        // 3. POST /api/analytics/visitor
        if (url === '/api/analytics/visitor' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const { visitorId, variant } = body;
            if (!visitorId || !variant) {
              sendJson(res, 400, { error: 'visitorId and variant required.' });
              return;
            }
            const record = registerVisitor({ visitorId, variant });
            sendJson(res, 200, { success: true, visitor: record });
          } catch (err) {
            console.error('API Error in /api/analytics/visitor:', err);
            sendJson(res, 500, { error: 'Failed to register visitor.' });
          }
          return;
        }

        // 4. POST /api/analytics/track
        if (url === '/api/analytics/track' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const { visitorId, scrollDepth, stage, reachedContact } = body;
            if (!visitorId) {
              sendJson(res, 400, { error: 'visitorId required.' });
              return;
            }
            updateTracking({ visitorId, scrollDepth, stage, reachedContact });
            sendJson(res, 200, { success: true });
          } catch (err) {
            console.error('API Error in /api/analytics/track:', err);
            sendJson(res, 500, { error: 'Failed to update tracking.' });
          }
          return;
        }

        // 5. GET /api/analytics/results
        if (url === '/api/analytics/results' && req.method === 'GET') {
          try {
            const results = getAnalyticsResults();
            sendJson(res, 200, { success: true, results });
          } catch (err) {
            console.error('API Error in GET /api/analytics/results:', err);
            sendJson(res, 500, { error: 'Failed to retrieve results.' });
          }
          return;
        }

        next();
      });
    },
    configurePreviewServer(server) {
      // Also enable in vite preview
      this.configureServer(server);
    },
  };
}

