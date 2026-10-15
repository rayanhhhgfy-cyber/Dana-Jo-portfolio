"use strict";
/* Repository API backed by SQLite (local development). All methods async
   so the Blob backend can share the same interface. */
const { db, transaction } = require("./sqlite");
const { slugify, nowIso } = require("./util");

function withImages(p) {
  if (!p) return null;
  p.images = db.prepare("SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order, id").all(p.id);
  return p;
}

const api = {
  backend: "sqlite",

  /* ---------- projects ---------- */
  async listProjects({ publishedOnly = false } = {}) {
    const sql = publishedOnly
      ? "SELECT * FROM projects WHERE published = 1 ORDER BY sort_order, created_at DESC"
      : "SELECT * FROM projects ORDER BY sort_order, created_at DESC";
    return db.prepare(sql).all();
  },
  async getProjectById(id) {
    return withImages(db.prepare("SELECT * FROM projects WHERE id = ?").get(id));
  },
  async getProjectBySlug(slug, { publishedOnly = false } = {}) {
    const sql = publishedOnly
      ? "SELECT * FROM projects WHERE slug = ? AND published = 1"
      : "SELECT * FROM projects WHERE slug = ?";
    return withImages(db.prepare(sql).get(slug));
  },
  async uniqueSlug(base, ignoreId) {
    let slug = slugify(base);
    let n = 2;
    const q = db.prepare("SELECT id FROM projects WHERE slug = ? AND id != ?");
    while (q.get(slug, ignoreId || -1)) slug = `${slugify(base)}-${n++}`;
    return slug;
  },
  async createProject(d) {
    const r = db.prepare(
      "INSERT INTO projects(title, title_ar, slug, description, description_ar, category, category_ar, cover_image, published, sort_order) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(d.title, d.title_ar || "", d.slug, d.description || "", d.description_ar || "",
      d.category || "", d.category_ar || "", d.cover_image || "", d.published ? 1 : 0, d.sort_order || 0);
    return r.lastInsertRowid;
  },
  async updateProject(id, d) {
    db.prepare(
      "UPDATE projects SET title = ?, title_ar = ?, description = ?, description_ar = ?, category = ?, category_ar = ?, cover_image = ?, published = ?, sort_order = ?, updated_at = ? WHERE id = ?"
    ).run(d.title, d.title_ar || "", d.description || "", d.description_ar || "",
      d.category || "", d.category_ar || "", d.cover_image || "", d.published ? 1 : 0,
      d.sort_order || 0, nowIso(), id);
  },
  async deleteProject(id) {
    const p = await this.getProjectById(id);
    if (p) db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return p;
  },
  async toggleProjectPublish(id) {
    db.prepare("UPDATE projects SET published = 1 - published, updated_at = ? WHERE id = ?").run(nowIso(), id);
    const r = db.prepare("SELECT published FROM projects WHERE id = ?").get(id);
    return r ? r.published : null;
  },
  async distinctCategories() {
    return db.prepare("SELECT DISTINCT category FROM projects WHERE published = 1 AND category != '' ORDER BY category")
      .all().map((r) => r.category);
  },

  /* ---------- project images ---------- */
  async addProjectImages(projectId, images) {
    const ins = db.prepare("INSERT INTO project_images(project_id, image_path, sort_order) VALUES(?, ?, ?)");
    transaction(() => { images.forEach((im) => ins.run(projectId, im.image_path, im.sort_order)); });
  },
  async getProjectImage(id) {
    return db.prepare("SELECT * FROM project_images WHERE id = ?").get(id) || null;
  },
  async deleteProjectImage(id) {
    const img = await this.getProjectImage(id);
    if (img) db.prepare("DELETE FROM project_images WHERE id = ?").run(id);
    return img;
  },
  async updateProjectImageCaption(id, caption, caption_ar) {
    db.prepare("UPDATE project_images SET caption = ?, caption_ar = ? WHERE id = ?").run(caption || "", caption_ar || "", id);
  },
  async maxImageSort(projectId) {
    return db.prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM project_images WHERE project_id = ?").get(projectId).m;
  },

  /* ---------- services ---------- */
  async listServices({ publishedOnly = false } = {}) {
    const sql = publishedOnly
      ? "SELECT * FROM services WHERE published = 1 ORDER BY sort_order"
      : "SELECT * FROM services ORDER BY sort_order";
    return db.prepare(sql).all();
  },
  async getService(id) {
    return db.prepare("SELECT * FROM services WHERE id = ?").get(id) || null;
  },
  async createService(d) {
    const r = db.prepare("INSERT INTO services(title, title_ar, description, description_ar, published, sort_order) VALUES(?, ?, ?, ?, ?, ?)")
      .run(d.title, d.title_ar || "", d.description || "", d.description_ar || "", d.published ? 1 : 0, d.sort_order || 0);
    return r.lastInsertRowid;
  },
  async updateService(id, d) {
    db.prepare("UPDATE services SET title = ?, title_ar = ?, description = ?, description_ar = ?, published = ?, sort_order = ? WHERE id = ?")
      .run(d.title, d.title_ar || "", d.description || "", d.description_ar || "", d.published ? 1 : 0, d.sort_order || 0, id);
  },
  async deleteService(id) {
    db.prepare("DELETE FROM services WHERE id = ?").run(id);
  },
  async toggleService(id) {
    db.prepare("UPDATE services SET published = 1 - published WHERE id = ?").run(id);
    const r = db.prepare("SELECT published FROM services WHERE id = ?").get(id);
    return r ? r.published : null;
  },

  /* ---------- announcements ---------- */
  async listAnnouncements({ publishedOnly = false, limit = 0 } = {}) {
    let sql = publishedOnly
      ? "SELECT * FROM announcements WHERE published = 1 ORDER BY created_at DESC"
      : "SELECT * FROM announcements ORDER BY created_at DESC";
    if (limit > 0) sql += ` LIMIT ${parseInt(limit, 10)}`;
    return db.prepare(sql).all();
  },
  async getAnnouncement(id) {
    return db.prepare("SELECT * FROM announcements WHERE id = ?").get(id) || null;
  },
  async createAnnouncement(d) {
    const r = db.prepare("INSERT INTO announcements(title, title_ar, body, body_ar, image_path, published) VALUES(?, ?, ?, ?, ?, ?)")
      .run(d.title, d.title_ar || "", d.body || "", d.body_ar || "", d.image_path || "", d.published ? 1 : 0);
    return r.lastInsertRowid;
  },
  async updateAnnouncement(id, d) {
    db.prepare("UPDATE announcements SET title = ?, title_ar = ?, body = ?, body_ar = ?, image_path = ?, published = ? WHERE id = ?")
      .run(d.title, d.title_ar || "", d.body || "", d.body_ar || "", d.image_path || "", d.published ? 1 : 0, id);
  },
  async deleteAnnouncement(id) {
    const a = await this.getAnnouncement(id);
    if (a) db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
    return a;
  },
  async toggleAnnouncement(id) {
    db.prepare("UPDATE announcements SET published = 1 - published WHERE id = ?").run(id);
    const r = db.prepare("SELECT published FROM announcements WHERE id = ?").get(id);
    return r ? r.published : null;
  },

  /* ---------- site content ---------- */
  async getAllContentRaw() {
    const out = {};
    for (const r of db.prepare("SELECT key, value FROM site_content").all()) out[r.key] = r.value;
    return out;
  },
  async setContent(entries) {
    const up = db.prepare("INSERT INTO site_content(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
    transaction(() => { for (const [k, v] of Object.entries(entries)) up.run(k, v); });
  },

  /* ---------- messages ---------- */
  async listMessages() {
    return db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all();
  },
  async createMessage({ name, email, message }) {
    db.prepare("INSERT INTO contact_messages(name, email, message) VALUES(?, ?, ?)").run(name, email, message);
  },
  async markMessageRead(id) {
    db.prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?").run(id);
  },
  async deleteMessage(id) {
    db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
  },
  async unreadCount() {
    return db.prepare("SELECT COUNT(*) AS c FROM contact_messages WHERE is_read = 0").get().c;
  },
  async counts() {
    return {
      projects: db.prepare("SELECT COUNT(*) c FROM projects").get().c,
      published: db.prepare("SELECT COUNT(*) c FROM projects WHERE published = 1").get().c,
      messages: db.prepare("SELECT COUNT(*) c FROM contact_messages").get().c,
      unread: await this.unreadCount(),
      announcements: db.prepare("SELECT COUNT(*) c FROM announcements").get().c,
      services: db.prepare("SELECT COUNT(*) c FROM services").get().c,
    };
  },

  /* ---------- users ---------- */
  async getUserByEmail(email) {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email) || null;
  },
  async upsertUser(email, passwordHash) {
    db.prepare("INSERT INTO users(email, password_hash) VALUES(?, ?) ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash")
      .run(email, passwordHash);
  },
  async userCount() {
    return db.prepare("SELECT COUNT(*) c FROM users").get().c;
  },
};

module.exports = api;
