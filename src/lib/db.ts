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
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      added_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_code TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      airline TEXT,
      booking_site TEXT,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (destination_code) REFERENCES destinations(code)
    );

    CREATE INDEX IF NOT EXISTS idx_price_history_dest 
      ON price_history(destination_code);
    CREATE INDEX IF NOT EXISTS idx_price_history_date 
      ON price_history(recorded_at);
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
    currentDbPath = null;
  }
}

export function seedDefaults() {
  if (!db) return;
  
  const hasConfig = db.prepare('SELECT COUNT(*) as count FROM config').get() as { count: number };
  if (hasConfig.count === 0) {
    db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('home_airport', 'BER');
  }
  
  const hasDestinations = db.prepare('SELECT COUNT(*) as count FROM destinations').get() as { count: number };
  if (hasDestinations.count === 0) {
    const defaults = ['JFK', 'LIS', 'BKK'];
    const insert = db.prepare('INSERT OR IGNORE INTO destinations (code) VALUES (?)');
    for (const code of defaults) {
      insert.run(code);
    }
  }
}
