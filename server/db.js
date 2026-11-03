import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'growth_funnel.db');
const db = new DatabaseSync(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS visitors (
    visitor_id TEXT PRIMARY KEY,
    variant TEXT NOT NULL,
    max_scroll_depth INTEGER NOT NULL DEFAULT 0,
    reached_awareness INTEGER NOT NULL DEFAULT 0,
    reached_interest INTEGER NOT NULL DEFAULT 0,
    reached_consideration INTEGER NOT NULL DEFAULT 0,
    reached_hire INTEGER NOT NULL DEFAULT 0,
    reached_contact INTEGER NOT NULL DEFAULT 0,
    submitted_contact INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export function saveSubmission({ name, email, company, message, visitorId }) {
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO submissions (name, email, company, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, email, company, message, createdAt);

  if (visitorId) {
    try {
      const visitorStmt = db.prepare(`
        UPDATE visitors
        SET submitted_contact = 1, reached_contact = 1, updated_at = ?
        WHERE visitor_id = ?
      `);
      visitorStmt.run(createdAt, visitorId);
    } catch (err) {
      console.error('Error updating visitor on submission:', err);
    }
  }

  return {
    id: result.lastInsertRowid,
    name,
    email,
    company,
    message,
    created_at: createdAt,
  };
}

export function getSubmissions() {
  const stmt = db.prepare(`
    SELECT * FROM submissions
    ORDER BY id DESC
  `);
  return stmt.all();
}

export function registerVisitor({ visitorId, variant }) {
  const now = new Date().toISOString();
  const existingStmt = db.prepare(`
    SELECT * FROM visitors WHERE visitor_id = ?
  `);
  const existing = existingStmt.get(visitorId);

  if (existing) {
    return existing;
  }

  const insertStmt = db.prepare(`
    INSERT INTO visitors (visitor_id, variant, max_scroll_depth, created_at, updated_at)
    VALUES (?, ?, 0, ?, ?)
  `);
  insertStmt.run(visitorId, variant, now, now);

  return {
    visitor_id: visitorId,
    variant,
    max_scroll_depth: 0,
    created_at: now,
    updated_at: now,
  };
}

export function updateTracking({
  visitorId,
  scrollDepth = 0,
  stage = null,
  reachedContact = false,
}) {
  const now = new Date().toISOString();
  const depth = Math.max(0, Math.min(100, Math.round(scrollDepth)));

  // Check existing
  const existingStmt = db.prepare(`
    SELECT * FROM visitors WHERE visitor_id = ?
  `);
  const existing = existingStmt.get(visitorId);

  if (!existing) {
    return null;
  }

  const newMaxDepth = Math.max(existing.max_scroll_depth || 0, depth);
  const reachedAwareness = existing.reached_awareness || (stage === 'awareness' || depth >= 15 ? 1 : 0);
  const reachedInterest = existing.reached_interest || (stage === 'interest' || depth >= 40 ? 1 : 0);
  const reachedConsideration = existing.reached_consideration || (stage === 'consideration' || depth >= 65 ? 1 : 0);
  const reachedHire = existing.reached_hire || (stage === 'hire' || depth >= 85 ? 1 : 0);
  const reachedContactVal = existing.reached_contact || (reachedContact ? 1 : 0);

  const updateStmt = db.prepare(`
    UPDATE visitors
    SET max_scroll_depth = ?,
        reached_awareness = ?,
        reached_interest = ?,
        reached_consideration = ?,
        reached_hire = ?,
        reached_contact = ?,
        updated_at = ?
    WHERE visitor_id = ?
  `);
  updateStmt.run(
    newMaxDepth,
    reachedAwareness,
    reachedInterest,
    reachedConsideration,
    reachedHire,
    reachedContactVal,
    now,
    visitorId
  );

  return { success: true };
}

export function getAnalyticsResults() {
  const variants = ['A', 'B'];
  const results = {};

  for (const variant of variants) {
    const totalStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ?
    `);
    const totalVisitors = Number(totalStmt.get(variant)?.count || 0);

    const avgDepthStmt = db.prepare(`
      SELECT AVG(max_scroll_depth) as avg_depth FROM visitors WHERE variant = ?
    `);
    const avgDepth = Number(avgDepthStmt.get(variant)?.avg_depth || 0);

    const awarenessStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_awareness = 1
    `);
    const reachedAwareness = Number(awarenessStmt.get(variant)?.count || 0);

    const interestStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_interest = 1
    `);
    const reachedInterest = Number(interestStmt.get(variant)?.count || 0);

    const considerationStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_consideration = 1
    `);
    const reachedConsideration = Number(considerationStmt.get(variant)?.count || 0);

    const hireStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_hire = 1
    `);
    const reachedHire = Number(hireStmt.get(variant)?.count || 0);

    const contactReachedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_contact = 1
    `);
    const reachedContact = Number(contactReachedStmt.get(variant)?.count || 0);

    const submittedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND submitted_contact = 1
    `);
    const submittedCount = Number(submittedStmt.get(variant)?.count || 0);

    results[variant] = {
      variant,
      totalVisitors,
      avgScrollDepth: Math.round(avgDepth),
      funnelDropoff: {
        awareness: reachedAwareness,
        interest: reachedInterest,
        consideration: reachedConsideration,
        hire: reachedHire,
      },
      reachedContact,
      submittedCount,
      conversionRate:
        totalVisitors > 0
          ? ((submittedCount / totalVisitors) * 100).toFixed(1)
          : '0.0',
      contactReachedRate:
        totalVisitors > 0
          ? ((reachedContact / totalVisitors) * 100).toFixed(1)
          : '0.0',
    };
  }

  return results;
}

