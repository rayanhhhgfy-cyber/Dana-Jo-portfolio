"use strict";
/* SQLite connection + schema (node:sqlite, zero native deps).
   Used for local development. Production on Vercel uses the Blob JSON store. */
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const { slugify, nowIso } = require("./util");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, "dana.db");

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_ar TEXT DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  category TEXT DEFAULT '',
  category_ar TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  caption TEXT DEFAULT '',
  caption_ar TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_ar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_ar TEXT DEFAULT '',
  body TEXT DEFAULT '',
  body_ar TEXT DEFAULT '',
  image_path TEXT DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

/* Idempotent bilingual-column migration for databases created before i18n. */
const AR_COLUMNS = [
  ["projects", "title_ar"], ["projects", "description_ar"], ["projects", "category_ar"],
  ["project_images", "caption_ar"],
  ["services", "title_ar"], ["services", "description_ar"],
  ["announcements", "title_ar"], ["announcements", "body_ar"],
];
for (const [table, col] of AR_COLUMNS) {
  const exists = db.prepare("SELECT name FROM pragma_table_info(?) WHERE name = ?").get(table, col);
  if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT DEFAULT ''`);
}

/* node:sqlite has no .transaction() helper — minimal wrapper */
function transaction(fn) {
  db.exec("BEGIN");
  try {
    fn();
    db.exec("COMMIT");
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch {}
    throw e;
  }
}

module.exports = { db, transaction, slugify, nowIso };
