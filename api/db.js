import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DatabaseSync } from 'node:sqlite';

// Determine Database Mode:
// 1. If TURSO_DATABASE_URL (or LIBSQL_URL) is present -> Cloud SQLite (Turso) over HTTPS
// 2. Otherwise -> Local SQLite using node:sqlite (data/ locally or /tmp on Vercel)
const rawTursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '';
const rawTursoToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN || '';

const tursoUrl = rawTursoUrl.trim();
const tursoToken = rawTursoToken.trim();

export const isTurso = Boolean(tursoUrl && tursoToken);

export function getStorageMode() {
  return isTurso ? 'turso' : 'ephemeral';
}

// ============================================================================
// 1. TURSO CLOUD SQLITE HTTP ADAPTER (Zero external dependencies)
// ============================================================================
async function executeTurso(statements) {
  let httpsUrl = tursoUrl;
  if (!httpsUrl.startsWith('http://') && !httpsUrl.startsWith('https://')) {
    if (httpsUrl.startsWith('libsql://')) {
      httpsUrl = httpsUrl.replace('libsql://', 'https://');
    } else {
      httpsUrl = 'https://' + httpsUrl;
    }
  }
  httpsUrl = httpsUrl.replace(/\/$/, '');
  
  const requests = statements.map((stmt) => {
    const sql = typeof stmt === 'string' ? stmt : stmt.sql;
    const rawArgs = typeof stmt === 'object' && stmt.args ? stmt.args : [];

    const args = rawArgs.map((val) => {
      if (val === null || val === undefined) return { type: 'null' };
      if (typeof val === 'number') {
        return Number.isInteger(val)
          ? { type: 'integer', value: String(val) }
          : { type: 'float', value: val };
      }
      return { type: 'text', value: String(val) };
    });

    return {
      type: 'execute',
      stmt: { sql, args },
    };
  });

  requests.push({ type: 'close' });

  const res = await fetch(`${httpsUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tursoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Turso HTTP Error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const results = [];

  for (let i = 0; i < statements.length; i++) {
    const item = json.results[i];
    if (item.type === 'error') {
      throw new Error(`Turso SQL Error: ${item.error.message}`);
    }

    const execRes = item.response?.result;
    if (!execRes) {
      results.push({ rows: [], affectedCount: 0, lastInsertRowid: null });
      continue;
    }

    const colNames = (execRes.cols || []).map((c) => c.name);
    const rows = (execRes.rows || []).map((r) => {
      const obj = {};
      r.forEach((cell, idx) => {
        const col = colNames[idx];
        if (cell.type === 'null') {
          obj[col] = null;
        } else if (cell.type === 'integer') {
          obj[col] = Number(cell.value);
        } else if (cell.type === 'float') {
          obj[col] = Number(cell.value);
        } else {
          obj[col] = cell.value;
        }
      });
      return obj;
    });

    results.push({
      rows,
      affectedCount: execRes.affected_row_count || 0,
      lastInsertRowid: execRes.last_insert_rowid || null,
    });
  }

  return results;
}

// ============================================================================
// 2. LOCAL SQLITE ADAPTER (node:sqlite)
// ============================================================================
let localDbInstance = null;

function getLocalDb() {
  if (localDbInstance) return localDbInstance;

  // If running in Vercel serverless environment without Turso, use /tmp
  const isVercel = Boolean(process.env.VERCEL);
  const dataDir = isVercel
    ? path.join(os.tmpdir(), 'growth-funnel-data')
    : path.resolve(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // ignore if already exists
    }
  }

  const dbPath = path.join(dataDir, 'growth_funnel.db');
  localDbInstance = new DatabaseSync(dbPath);

  // Initialize Schema
  localDbInstance.exec(`
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

  return localDbInstance;
}

// Ensure schema is initialized once on startup
let schemaInitialized = false;
async function ensureSchema() {
  if (schemaInitialized) return;

  if (isTurso) {
    await executeTurso([
      `CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS visitors (
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
      )`,
    ]);
  } else {
    // Local DB initializes in getLocalDb()
    getLocalDb();
  }

  schemaInitialized = true;
}

// ============================================================================
// 3. UNIFIED BUSINESS METHODS (Work with both Turso and Local SQLite)
// ============================================================================

export async function saveSubmission({ name, email, company, message, visitorId }) {
  await ensureSchema();
  const createdAt = new Date().toISOString();

  if (isTurso) {
    const queries = [
      {
        sql: `INSERT INTO submissions (name, email, company, message, created_at) VALUES (?, ?, ?, ?, ?)`,
        args: [name, email, company, message, createdAt],
      },
    ];

    if (visitorId) {
      queries.push({
        sql: `UPDATE visitors SET submitted_contact = 1, reached_contact = 1, updated_at = ? WHERE visitor_id = ?`,
        args: [createdAt, visitorId],
      });
    }

    const results = await executeTurso(queries);
    return {
      id: results[0]?.lastInsertRowid || Date.now(),
      name,
      email,
      company,
      message,
      created_at: createdAt,
    };
  } else {
    const db = getLocalDb();
    const stmt = db.prepare(`
      INSERT INTO submissions (name, email, company, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, company, message, createdAt);

    if (visitorId) {
      try {
        const vStmt = db.prepare(`
          UPDATE visitors
          SET submitted_contact = 1, reached_contact = 1, updated_at = ?
          WHERE visitor_id = ?
        `);
        vStmt.run(createdAt, visitorId);
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
}

export async function getSubmissions() {
  await ensureSchema();

  if (isTurso) {
    const results = await executeTurso([
      { sql: `SELECT * FROM submissions ORDER BY id DESC`, args: [] },
    ]);
    return results[0]?.rows || [];
  } else {
    const db = getLocalDb();
    const stmt = db.prepare(`SELECT * FROM submissions ORDER BY id DESC`);
    return stmt.all();
  }
}

export async function deleteSubmission(id) {
  await ensureSchema();

  if (isTurso) {
    await executeTurso([
      { sql: `DELETE FROM submissions WHERE id = ?`, args: [Number(id)] },
    ]);
  } else {
    const db = getLocalDb();
    db.prepare(`DELETE FROM submissions WHERE id = ?`).run(Number(id));
  }

  return { success: true };
}

export async function clearAllSubmissions() {
  await ensureSchema();

  if (isTurso) {
    await executeTurso([
      { sql: `DELETE FROM submissions`, args: [] },
    ]);
  } else {
    const db = getLocalDb();
    db.prepare(`DELETE FROM submissions`).run();
  }

  return { success: true };
}

export async function registerVisitor({ visitorId, variant }) {
  await ensureSchema();
  const now = new Date().toISOString();

  if (isTurso) {
    const existingRes = await executeTurso([
      { sql: `SELECT * FROM visitors WHERE visitor_id = ?`, args: [visitorId] },
    ]);

    if (existingRes[0]?.rows?.length > 0) {
      return existingRes[0].rows[0];
    }

    await executeTurso([
      {
        sql: `INSERT INTO visitors (visitor_id, variant, max_scroll_depth, created_at, updated_at) VALUES (?, ?, 0, ?, ?)`,
        args: [visitorId, variant, now, now],
      },
    ]);

    return {
      visitor_id: visitorId,
      variant,
      max_scroll_depth: 0,
      created_at: now,
      updated_at: now,
    };
  } else {
    const db = getLocalDb();
    const existing = db.prepare(`SELECT * FROM visitors WHERE visitor_id = ?`).get(visitorId);
    if (existing) return existing;

    const insert = db.prepare(`
      INSERT INTO visitors (visitor_id, variant, max_scroll_depth, created_at, updated_at)
      VALUES (?, ?, 0, ?, ?)
    `);
    insert.run(visitorId, variant, now, now);

    return {
      visitor_id: visitorId,
      variant,
      max_scroll_depth: 0,
      created_at: now,
      updated_at: now,
    };
  }
}

export async function updateTracking({
  visitorId,
  scrollDepth = 0,
  stage = null,
  reachedContact = false,
}) {
  await ensureSchema();
  const now = new Date().toISOString();
  const depth = Math.max(0, Math.min(100, Math.round(scrollDepth)));

  if (isTurso) {
    const existingRes = await executeTurso([
      { sql: `SELECT * FROM visitors WHERE visitor_id = ?`, args: [visitorId] },
    ]);
    const existing = existingRes[0]?.rows?.[0];
    if (!existing) return null;

    const newMaxDepth = Math.max(existing.max_scroll_depth || 0, depth);
    const reachedAwareness = existing.reached_awareness || (stage === 'awareness' || depth >= 15 ? 1 : 0);
    const reachedInterest = existing.reached_interest || (stage === 'interest' || depth >= 40 ? 1 : 0);
    const reachedConsideration = existing.reached_consideration || (stage === 'consideration' || depth >= 65 ? 1 : 0);
    const reachedHire = existing.reached_hire || (stage === 'hire' || depth >= 85 ? 1 : 0);
    const reachedContactVal = existing.reached_contact || (reachedContact ? 1 : 0);

    await executeTurso([
      {
        sql: `UPDATE visitors
              SET max_scroll_depth = ?,
                  reached_awareness = ?,
                  reached_interest = ?,
                  reached_consideration = ?,
                  reached_hire = ?,
                  reached_contact = ?,
                  updated_at = ?
              WHERE visitor_id = ?`,
        args: [
          newMaxDepth,
          reachedAwareness,
          reachedInterest,
          reachedConsideration,
          reachedHire,
          reachedContactVal,
          now,
          visitorId,
        ],
      },
    ]);

    return { success: true };
  } else {
    const db = getLocalDb();
    const existing = db.prepare(`SELECT * FROM visitors WHERE visitor_id = ?`).get(visitorId);
    if (!existing) return null;

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
}

export async function getAnalyticsResults() {
  await ensureSchema();
  const variants = ['A', 'B'];
  const results = {};

  if (isTurso) {
    for (const variant of variants) {
      const res = await executeTurso([
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ?`, args: [variant] },
        { sql: `SELECT AVG(max_scroll_depth) as avg_depth FROM visitors WHERE variant = ?`, args: [variant] },
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_awareness = 1`, args: [variant] },
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_interest = 1`, args: [variant] },
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_consideration = 1`, args: [variant] },
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_hire = 1`, args: [variant] },
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_contact = 1`, args: [variant] },
        { sql: `SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND submitted_contact = 1`, args: [variant] },
      ]);

      const totalVisitors = Number(res[0]?.rows?.[0]?.count || 0);
      const avgDepth = Number(res[1]?.rows?.[0]?.avg_depth || 0);
      const reachedAwareness = Number(res[2]?.rows?.[0]?.count || 0);
      const reachedInterest = Number(res[3]?.rows?.[0]?.count || 0);
      const reachedConsideration = Number(res[4]?.rows?.[0]?.count || 0);
      const reachedHire = Number(res[5]?.rows?.[0]?.count || 0);
      const reachedContact = Number(res[6]?.rows?.[0]?.count || 0);
      const submittedCount = Number(res[7]?.rows?.[0]?.count || 0);

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
  } else {
    const db = getLocalDb();
    for (const variant of variants) {
      const totalVisitors = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ?`).get(variant)?.count || 0
      );
      const avgDepth = Number(
        db.prepare(`SELECT AVG(max_scroll_depth) as avg_depth FROM visitors WHERE variant = ?`).get(variant)?.avg_depth || 0
      );
      const reachedAwareness = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_awareness = 1`).get(variant)?.count || 0
      );
      const reachedInterest = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_interest = 1`).get(variant)?.count || 0
      );
      const reachedConsideration = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_consideration = 1`).get(variant)?.count || 0
      );
      const reachedHire = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_hire = 1`).get(variant)?.count || 0
      );
      const reachedContact = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND reached_contact = 1`).get(variant)?.count || 0
      );
      const submittedCount = Number(
        db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE variant = ? AND submitted_contact = 1`).get(variant)?.count || 0
      );

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
  }

  return results;
}
