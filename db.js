"use strict";
/* SQLite database layer (node:sqlite, zero native deps). */
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
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
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
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
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
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

const DEFAULT_CONTENT = {
  hero_kicker: "Graphic Designer · Portfolio",
  hero_title: "Dana Jo",
  hero_subtitle:
    "Graphic designer with 5 years of experience crafting thoughtful identities, print and digital design — where every detail earns its place.",
  hero_cta_primary: "View Work",
  hero_cta_secondary: "Get in Touch",
  about_title: "About Dana",
  about_body:
    "Dana Jo is a graphic designer with five years of experience. Her work focuses on clear, considered design — from brand identities to print and digital pieces — built around the client's story and made to last.\n\nThis portfolio collects selected work. New pieces are added as they are completed.",
  about_years: "5",
  about_projects_label: "Years of experience",
  services_title: "Services",
  services_subtitle: "Design services, tailored to each project.",
  work_title: "Selected Work",
  work_subtitle: "A curated collection of projects. Filter by category.",
  contact_title: "Get in Touch",
  contact_subtitle: "Have a project in mind? Send a message — every enquiry is read personally.",
  whatsapp_url: "https://wa.me/962798061352",
  facebook_url: "https://www.facebook.com/share/1UNyRxe3nU/?mibextid=wwXIfr",
  footer_tagline: "Thoughtful design, made to last.",
};

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

const getContent = db.prepare("SELECT value FROM site_content WHERE key = ?");
function content(key) {
  const row = getContent.get(key);
  return row ? row.value : DEFAULT_CONTENT[key] || "";
}
function allContent() {
  const out = {};
  for (const k of Object.keys(DEFAULT_CONTENT)) out[k] = content(k);
  return out;
}
const upsertContent = db.prepare(
  "INSERT INTO site_content(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
);
function seedContent() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM site_content").get().c;
  if (count === 0) {
    transaction(() => {
      for (const [k, v] of Object.entries(DEFAULT_CONTENT)) upsertContent.run(k, v);
    });
  }
}
function seedServices() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM services").get().c;
  if (count === 0) {
    const ins = db.prepare(
      "INSERT INTO services(title, description, published, sort_order) VALUES(?, ?, 1, ?)"
    );
    transaction(() => {
      ins.run("Brand Identity", "Logos and visual identity systems designed around your story — refined, consistent and built to last.", 0);
      ins.run("Social Media & Marketing Design", "Scroll-stopping visuals for campaigns, launches and everyday content across platforms.", 1);
      ins.run("Print & Editorial Design", "Brochures, packaging, stationery and layouts with careful typography and craft.", 2);
    });
  }
}

function slugify(title) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[''"]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "project"
  );
}
function uniqueSlug(base, ignoreId) {
  let slug = slugify(base);
  let n = 2;
  const q = db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?");
  while (q.get(slug, ignoreId || -1)) slug = `${slugify(base)}-${n++}`;
  return slug;
}

module.exports = { db, content, allContent, upsertContent, seedContent, seedServices, slugify, uniqueSlug, transaction };
