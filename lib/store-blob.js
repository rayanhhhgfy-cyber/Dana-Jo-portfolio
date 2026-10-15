"use strict";
/* Repository API backed by Vercel Blob JSON documents.
   Used in production on Vercel (serverless — no persistent disk).
   Each table is one JSON doc at dana-store/<name>.json, written atomically
   with allowOverwrite. Reads use a tiny TTL cache; every mutation re-reads
   fresh first so concurrent instances don't clobber each other. */
const { slugify, nowIso } = require("./util");
const { withRetry, withLock } = require("./retry");

const PREFIX = "dana-store/";
const READ_TTL_MS = 5000;

let blob = null;
function client() {
  if (!blob) blob = require("@vercel/blob");
  return blob;
}

const clone = (o) => JSON.parse(JSON.stringify(o));

const cache = new Map(); // name -> { at, doc }

function emptyDoc(name) {
  if (name === "content") return { values: {} };
  return { seq: 0, rows: [] };
}

async function fetchDoc(name) {
  const { list } = client();
  const pathname = PREFIX + name + ".json";
  const { blobs } = await withRetry(() => list({ prefix: PREFIX }));
  const hit = blobs.find((b) => b.pathname === pathname);
  if (!hit) return emptyDoc(name);
  const res = await withRetry(() => fetch(hit.url, { cache: "no-store" }));
  if (!res.ok) return emptyDoc(name);
  try {
    const doc = await res.json();
    if (!doc || typeof doc !== "object") return emptyDoc(name);
    if (!Array.isArray(doc.rows) && !doc.values) return emptyDoc(name);
    return doc;
  } catch {
    return emptyDoc(name);
  }
}

async function readDoc(name, fresh = false) {
  const c = cache.get(name);
  if (!fresh && c && Date.now() - c.at < READ_TTL_MS) return clone(c.doc);
  const doc = await fetchDoc(name);
  cache.set(name, { at: Date.now(), doc: clone(doc) });
  return clone(doc);
}

async function writeDoc(name, doc) {
  const { put } = client();
  await withRetry(() => put(PREFIX + name + ".json", JSON.stringify(doc), {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  }));
  cache.set(name, { at: Date.now(), doc: clone(doc) });
}

/* Serialize mutations per document so concurrent admin actions
   on one instance can't interleave read-modify-write cycles. */
function mut(name, fn) {
  return withLock("doc:" + name, fn);
}

function sortProjects(rows) {
  return rows.slice().sort((a, b) => (a.sort_order - b.sort_order) || (b.created_at < a.created_at ? -1 : 1));
}

const api = {
  backend: "blob",

  /* ---------- projects ---------- */
  async listProjects({ publishedOnly = false } = {}) {
    const doc = await readDoc("projects");
    let rows = sortProjects(doc.rows);
    if (publishedOnly) rows = rows.filter((r) => r.published === 1);
    return rows;
  },
  async getProjectById(id) {
    const doc = await readDoc("projects");
    return doc.rows.find((r) => r.id === Number(id)) || null;
  },
  async getProjectBySlug(slug, { publishedOnly = false } = {}) {
    const doc = await readDoc("projects");
    const r = doc.rows.find((x) => x.slug === slug && (!publishedOnly || x.published === 1));
    return r || null;
  },
  async uniqueSlug(base, ignoreId) {
    const doc = await readDoc("projects", true);
    let slug = slugify(base);
    let n = 2;
    const taken = (s) => doc.rows.some((r) => r.slug === s && r.id !== Number(ignoreId || -1));
    while (taken(slug)) slug = `${slugify(base)}-${n++}`;
    return slug;
  },
  async createProject(d) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      const id = ++doc.seq;
      const ts = nowIso();
      doc.rows.push({
        id, title: d.title, title_ar: d.title_ar || "", slug: d.slug,
        description: d.description || "", description_ar: d.description_ar || "",
        category: d.category || "", category_ar: d.category_ar || "",
        cover_image: d.cover_image || "", published: d.published ? 1 : 0,
        sort_order: d.sort_order || 0, created_at: ts, updated_at: ts,
        images: [], imgSeq: 0,
      });
      await writeDoc("projects", doc);
      return id;
    });
  },
  async updateProject(id, d) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (!r) return;
      Object.assign(r, {
        title: d.title, title_ar: d.title_ar || "",
        description: d.description || "", description_ar: d.description_ar || "",
        category: d.category || "", category_ar: d.category_ar || "",
        cover_image: d.cover_image || "", published: d.published ? 1 : 0,
        sort_order: d.sort_order || 0, updated_at: nowIso(),
      });
      await writeDoc("projects", doc);
    });
  },
  async deleteProject(id) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      const i = doc.rows.findIndex((x) => x.id === Number(id));
      if (i < 0) return null;
      const [gone] = doc.rows.splice(i, 1);
      await writeDoc("projects", doc);
      return gone;
    });
  },
  async toggleProjectPublish(id) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (!r) return null;
      r.published = r.published ? 0 : 1;
      r.updated_at = nowIso();
      await writeDoc("projects", doc);
      return r.published;
    });
  },
  async distinctCategories() {
    const doc = await readDoc("projects");
    const set = new Set();
    for (const r of doc.rows) if (r.published === 1 && r.category) set.add(r.category);
    return [...set].sort();
  },

  /* ---------- project images ---------- */
  async addProjectImages(projectId, images) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      const r = doc.rows.find((x) => x.id === Number(projectId));
      if (!r) return;
      for (const im of images) {
        r.images.push({ id: ++r.imgSeq, image_path: im.image_path, caption: "", caption_ar: "", sort_order: im.sort_order });
      }
      r.images.sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
      r.updated_at = nowIso();
      await writeDoc("projects", doc);
    });
  },
  async getProjectImage(id) {
    const doc = await readDoc("projects");
    for (const r of doc.rows) {
      const im = (r.images || []).find((x) => x.id === Number(id));
      if (im) return { ...im, project_id: r.id };
    }
    return null;
  },
  async deleteProjectImage(id) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      for (const r of doc.rows) {
        const i = (r.images || []).findIndex((x) => x.id === Number(id));
        if (i >= 0) {
          const [gone] = r.images.splice(i, 1);
          r.updated_at = nowIso();
          await writeDoc("projects", doc);
          return { ...gone, project_id: r.id };
        }
      }
      return null;
    });
  },
  async updateProjectImageCaption(id, caption, caption_ar) {
    return mut("projects", async () => {
      const doc = await readDoc("projects", true);
      for (const r of doc.rows) {
        const im = (r.images || []).find((x) => x.id === Number(id));
        if (im) {
          im.caption = caption || "";
          im.caption_ar = caption_ar || "";
          await writeDoc("projects", doc);
          return;
        }
      }
    });
  },
  async maxImageSort(projectId) {
    const doc = await readDoc("projects");
    const r = doc.rows.find((x) => x.id === Number(projectId));
    if (!r || !r.images.length) return -1;
    return Math.max(...r.images.map((im) => im.sort_order));
  },

  /* ---------- services ---------- */
  async listServices({ publishedOnly = false } = {}) {
    const doc = await readDoc("services");
    let rows = doc.rows.slice().sort((a, b) => a.sort_order - b.sort_order);
    if (publishedOnly) rows = rows.filter((r) => r.published === 1);
    return rows;
  },
  async getService(id) {
    const doc = await readDoc("services");
    return doc.rows.find((r) => r.id === Number(id)) || null;
  },
  async createService(d) {
    return mut("services", async () => {
      const doc = await readDoc("services", true);
      const id = ++doc.seq;
      doc.rows.push({
        id, title: d.title, title_ar: d.title_ar || "",
        description: d.description || "", description_ar: d.description_ar || "",
        published: d.published ? 1 : 0, sort_order: d.sort_order || 0, created_at: nowIso(),
      });
      await writeDoc("services", doc);
      return id;
    });
  },
  async updateService(id, d) {
    return mut("services", async () => {
      const doc = await readDoc("services", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (!r) return;
      Object.assign(r, {
        title: d.title, title_ar: d.title_ar || "",
        description: d.description || "", description_ar: d.description_ar || "",
        published: d.published ? 1 : 0, sort_order: d.sort_order || 0,
      });
      await writeDoc("services", doc);
    });
  },
  async deleteService(id) {
    return mut("services", async () => {
      const doc = await readDoc("services", true);
      doc.rows = doc.rows.filter((r) => r.id !== Number(id));
      await writeDoc("services", doc);
    });
  },
  async toggleService(id) {
    return mut("services", async () => {
      const doc = await readDoc("services", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (!r) return null;
      r.published = r.published ? 0 : 1;
      await writeDoc("services", doc);
      return r.published;
    });
  },

  /* ---------- announcements ---------- */
  async listAnnouncements({ publishedOnly = false, limit = 0 } = {}) {
    const doc = await readDoc("announcements");
    let rows = doc.rows.slice().sort((a, b) => (b.created_at < a.created_at ? -1 : 1));
    if (publishedOnly) rows = rows.filter((r) => r.published === 1);
    if (limit > 0) rows = rows.slice(0, limit);
    return rows;
  },
  async getAnnouncement(id) {
    const doc = await readDoc("announcements");
    return doc.rows.find((r) => r.id === Number(id)) || null;
  },
  async createAnnouncement(d) {
    return mut("announcements", async () => {
      const doc = await readDoc("announcements", true);
      const id = ++doc.seq;
      doc.rows.push({
        id, title: d.title, title_ar: d.title_ar || "",
        body: d.body || "", body_ar: d.body_ar || "",
        image_path: d.image_path || "", published: d.published ? 1 : 0, created_at: nowIso(),
      });
      await writeDoc("announcements", doc);
      return id;
    });
  },
  async updateAnnouncement(id, d) {
    return mut("announcements", async () => {
      const doc = await readDoc("announcements", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (!r) return;
      Object.assign(r, {
        title: d.title, title_ar: d.title_ar || "",
        body: d.body || "", body_ar: d.body_ar || "",
        image_path: d.image_path || "", published: d.published ? 1 : 0,
      });
      await writeDoc("announcements", doc);
    });
  },
  async deleteAnnouncement(id) {
    return mut("announcements", async () => {
      const doc = await readDoc("announcements", true);
      const i = doc.rows.findIndex((x) => x.id === Number(id));
      if (i < 0) return null;
      const [gone] = doc.rows.splice(i, 1);
      await writeDoc("announcements", doc);
      return gone;
    });
  },
  async toggleAnnouncement(id) {
    return mut("announcements", async () => {
      const doc = await readDoc("announcements", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (!r) return null;
      r.published = r.published ? 0 : 1;
      await writeDoc("announcements", doc);
      return r.published;
    });
  },

  /* ---------- site content ---------- */
  async getAllContentRaw() {
    const doc = await readDoc("content");
    return { ...(doc.values || {}) };
  },
  async setContent(entries) {
    return mut("content", async () => {
      const doc = await readDoc("content", true);
      doc.values = { ...(doc.values || {}), ...entries };
      await writeDoc("content", doc);
    });
  },

  /* ---------- messages ---------- */
  async listMessages() {
    const doc = await readDoc("messages");
    return doc.rows.slice().sort((a, b) => (b.created_at < a.created_at ? -1 : 1));
  },
  async createMessage({ name, email, message }) {
    return mut("messages", async () => {
      const doc = await readDoc("messages", true);
      doc.rows.push({ id: ++doc.seq, name, email, message, is_read: 0, created_at: nowIso() });
      await writeDoc("messages", doc);
    });
  },
  async markMessageRead(id) {
    return mut("messages", async () => {
      const doc = await readDoc("messages", true);
      const r = doc.rows.find((x) => x.id === Number(id));
      if (r) { r.is_read = 1; await writeDoc("messages", doc); }
    });
  },
  async deleteMessage(id) {
    return mut("messages", async () => {
      const doc = await readDoc("messages", true);
      doc.rows = doc.rows.filter((r) => r.id !== Number(id));
      await writeDoc("messages", doc);
    });
  },
  async unreadCount() {
    const doc = await readDoc("messages");
    return doc.rows.filter((r) => !r.is_read).length;
  },
  async counts() {
    const [projects, announcements, services, messages] = await Promise.all([
      readDoc("projects"), readDoc("announcements"), readDoc("services"), readDoc("messages"),
    ]);
    return {
      projects: projects.rows.length,
      published: projects.rows.filter((r) => r.published === 1).length,
      messages: messages.rows.length,
      unread: messages.rows.filter((r) => !r.is_read).length,
      announcements: announcements.rows.length,
      services: services.rows.length,
    };
  },

  /* ---------- users ---------- */
  async getUserByEmail(email) {
    const doc = await readDoc("users");
    return doc.rows.find((r) => r.email === String(email).toLowerCase()) || null;
  },
  async upsertUser(email, passwordHash) {
    return mut("users", async () => {
      const doc = await readDoc("users", true);
      const em = String(email).toLowerCase();
      const r = doc.rows.find((x) => x.email === em);
      if (r) r.password_hash = passwordHash;
      else doc.rows.push({ id: ++doc.seq, email: em, password_hash: passwordHash, created_at: nowIso() });
      await writeDoc("users", doc);
    });
  },
  async userCount() {
    const doc = await readDoc("users");
    return doc.rows.length;
  },
};

module.exports = api;
