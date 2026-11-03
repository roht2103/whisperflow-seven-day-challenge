import {
  saveSubmission,
  getSubmissions,
  deleteSubmission,
  clearAllSubmissions,
  getStorageMode,
} from './db.js';
import { parseBody, sendJson } from './_utils.js';

export default async function handler(req, res) {
  // POST: create a new submission
  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { name, email, company, message, visitorId } = body;

      if (!name || !email || !company || !message) {
        return sendJson(res, 400, {
          error: 'All fields (name, email, company, message) are required.',
        });
      }

      const submission = await saveSubmission({
        name,
        email,
        company,
        message,
        visitorId,
      });

      return sendJson(res, 201, {
        success: true,
        submission,
        message: 'Thank you for reaching out! Your submission has been saved.',
      });
    } catch (err) {
      console.error('API Error in POST /api/submissions:', err);
      return sendJson(res, 500, { error: 'Failed to save submission.' });
    }
  }

  // GET: list all submissions
  if (req.method === 'GET') {
    try {
      const submissions = await getSubmissions();
      const storageMode = getStorageMode();
      return sendJson(res, 200, { success: true, submissions, storageMode });
    } catch (err) {
      console.error('API Error in GET /api/submissions:', err);
      return sendJson(res, 500, { error: 'Failed to retrieve submissions.' });
    }
  }

  // DELETE: delete by id or clear all
  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url, 'http://localhost');
      const id = url.searchParams.get('id');
      const clearAll = url.searchParams.get('all') === 'true';

      if (clearAll) {
        await clearAllSubmissions();
        return sendJson(res, 200, { success: true, message: 'All submissions cleared.' });
      }

      if (!id) {
        return sendJson(res, 400, { error: 'Submission ID is required.' });
      }

      await deleteSubmission(id);
      return sendJson(res, 200, { success: true, message: 'Submission deleted.' });
    } catch (err) {
      console.error('API Error in DELETE /api/submissions:', err);
      return sendJson(res, 500, { error: 'Failed to delete submission.' });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}

