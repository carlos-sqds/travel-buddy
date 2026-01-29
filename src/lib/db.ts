import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;
let currentDbPath: string | null = null;

export function getDb(customPath?: string): Database.Database {
  const dbPath = customPath || path.join(process.cwd(), 'flight-tracker.db');
  
  if (!db || currentDbPath !== dbPath) {
    if (db) {
      db.close();
    }
    db = new Database(dbPath);
    currentDbPath = dbPath;
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      UNIQUE(user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      added_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, code),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      destination_code TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      airline TEXT,
      booking_site TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_price_history_user 
      ON price_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_dest 
      ON price_history(user_id, destination_code);
    CREATE INDEX IF NOT EXISTS idx_price_history_date 
      ON price_history(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_config_user
      ON config(user_id);
    CREATE INDEX IF NOT EXISTS idx_destinations_user
      ON destinations(user_id);
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
    currentDbPath = null;
  }
}

export function createUser(userId: string): void {
  if (!db) return;
  db.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)').run(userId);
}

export function userExists(userId: string): boolean {
  if (!db) return false;
  const row = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as { id: string } | undefined;
  return !!row;
}

export function seedDefaultsForUser(userId: string): void {
  if (!db) return;
  
  createUser(userId);
  
  const hasConfig = db.prepare('SELECT COUNT(*) as count FROM config WHERE user_id = ?').get(userId) as { count: number };
  if (hasConfig.count === 0) {
    db.prepare('INSERT OR IGNORE INTO config (user_id, key, value) VALUES (?, ?, ?)').run(userId, 'home_airport', 'BER');
  }
  
  const hasDestinations = db.prepare('SELECT COUNT(*) as count FROM destinations WHERE user_id = ?').get(userId) as { count: number };
  if (hasDestinations.count === 0) {
    const defaults = ['JFK', 'LIS', 'BKK'];
    const insert = db.prepare('INSERT OR IGNORE INTO destinations (user_id, code) VALUES (?, ?)');
    for (const code of defaults) {
      insert.run(userId, code);
    }
  }
}
