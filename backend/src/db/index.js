import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "empty_miles.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS empty_legs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  carrier_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  earliest_date TEXT NOT NULL,
  latest_date TEXT NOT NULL,
  capacity_lbs INTEGER,
  truck_type TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS load_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shipper_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  cargo_type TEXT NOT NULL,
  weight_lbs INTEGER,
  needed_by TEXT NOT NULL,
  urgency TEXT DEFAULT 'standard',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empty_leg_id INTEGER NOT NULL REFERENCES empty_legs(id),
  load_request_id INTEGER NOT NULL REFERENCES load_requests(id),
  match_score REAL,
  suggested_price REAL,
  price_rationale TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(empty_leg_id, load_request_id)
);
`);
