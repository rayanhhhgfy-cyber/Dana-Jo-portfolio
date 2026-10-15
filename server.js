"use strict";
/* Dana Jo portfolio — full-stack Express app (public site + secure admin).
   Bilingual (EN/AR, RTL) · storage: SQLite locally, Vercel Blob JSON store in production. */
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cookieSession = require("cookie-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const methodOverride = require("method-override");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const { t, tf, L, dirOf } = require("./lib/i18n");
const { esc, parseCookies } = require("./lib/util");
const { store, contentFor, localized, seed, USE_BLOB } = require("./lib/store");
const { saveUploads, deleteUpload } = require("./lib/uploads");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

/* ---------- security & parsing ---------- */
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"), { maxAge: "7d" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "2mb" }));
app.use(methodOverride("_method"));

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
app.use(
  cookieSession({
    name: "dana_admin",
    keys: [SESSION_SECRET],
    maxAge: 1000 * 60 * 60 * 12,
    httpOnly: true,
    sameSite: "lax",
  })
);

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: "draft-7" });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: "draft-7" });

/* ---------- i18n middleware ---------- */
const LANG_COOKIE = "dj_lang";
const LANG_COOKIE_OPTS = { maxAge: 365 * 24 * 3600 * 1000, httpOnly: true, sameSite: "lax", path: "/" };

app.use((req, res, next) => {
  const q = req.query.lang;
  if ((q === "ar" || q === "en") && req.method === "GET") {
    res.cookie(LANG_COOKIE, q, LANG_COOKIE_OPTS);
    const url = new URL(req.originalUrl, "http://x");
    url.searchParams.delete("lang");
    return res.redirect(303, url.pathname + url.search);
  }
  let locale = "en";
  const c = parseCookies(req)[LANG_COOKIE];
  if (c === "ar" || c === "en") locale = c;
  else if (/^\s*ar/i.test(req.headers["accept-language"] || "")) locale = "ar";
  if (q === "ar" || q === "en") {
    locale = q;
    res.cookie(LANG_COOKIE, q, LANG_COOKIE_OPTS);
  }
  res.locals.locale = locale;
  res.locals.dir = dirOf(locale);
  res.locals.t = (k) => t(k, locale);
  res.locals.tf = (k, v) => tf(k, locale, v);
  res.locals.L = (row, field) => L(row, field, locale);
  next();
});

/* language switcher: /lang/ar or /lang/en, returns to the previous page */
app.get("/lang/:l", (req, res) => {
  const l = req.params.l === "ar" ? "ar" : "en";
  res.cookie(LANG_COOKIE, l, LANG_COOKIE_OPTS);
  const back = req.get("referer");
  if (back) {
    try {
      const u = new URL(back);
      if (u.host === req.get("host")) return res.redirect(u.pathname + u.search);
    } catch {}
  }
  res.redirect("/");
});

/* ---------- uploads (memory -> blob or disk) ---------- */
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_MIME.has(file.mimetype)),
});

/* ---------- helpers ---------- */
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  if (req.path.startsWith("/api/")) return res.status(401).json({ ok: false, error: t("err_unauthorized", res.locals.locale) });
  return res.redirect("/admin/login");
}
const C = (res) => contentFor(res.locals.locale);
const loc = (res, row, field) => localized(row, field, res.locals.locale);

/* ============================================================
   PUBLIC ROUTES
============================================================ */
app.get("/", async (_req, res, next) => {
  try {
    const locale = res.locals.locale;
    const projects = (await store.listProjects({ publishedOnly: true })).slice(0, 6);
    res.render("index", {
      c: await C(res),
      projects: projects.map((p) => ({ ...p, _title: loc(res, p, "title"), _category: loc(res, p, "category") })),
      services: (await store.listServices({ publishedOnly: true })).map((s) => ({ ...s, _title: loc(res, s, "title"), _desc: loc(res, s, "description") })),
      announcements: (await store.listAnnouncements({ publishedOnly: true, limit: 3 })).map((a) => ({ ...a, _title: loc(res, a, "title"), _body: loc(res, a, "body") })),
      page: "home", locale,
    });
  } catch (e) { next(e); }
});

app.get("/work", async (req, res, next) => {
  try {
    const cat = (req.query.category || "").trim();
    let projects = await store.listProjects({ publishedOnly: true });
    if (cat) projects = projects.filter((p) => p.category === cat);
    // localized category labels (canonical value kept for filtering)
    const seen = new Map();
    for (const p of await store.listProjects({ publishedOnly: true })) {
      if (p.category && !seen.has(p.category)) seen.set(p.category, loc(res, p, "category") || p.category);
    }
    res.render("work", {
      c: await C(res),
      projects: projects.map((p) => ({ ...p, _title: loc(res, p, "title"), _category: loc(res, p, "category") })),
      categories: [...seen.entries()].map(([value, label]) => ({ value, label })),
      activeCat: cat,
      activeCatLabel: seen.get(cat) || cat,
      page: "work",
    });
  } catch (e) { next(e); }
});

app.get("/work/:slug", async (req, res, next) => {
  try {
    const p = await store.getProjectBySlug(req.params.slug, { publishedOnly: true });
    if (!p) return res.status(404).render("404", { c: await C(res), page: "" });
    const others = (await store.listProjects({ publishedOnly: true })).filter((x) => x.id !== p.id).slice(0, 3);
    const view = (row) => ({ ...row, _title: loc(res, row, "title"), _category: loc(res, row, "category"), _desc: loc(res, row, "description") });
    const pv = view(p);
    pv.images = (p.images || []).map((im) => ({ ...im, _caption: loc(res, im, "caption") }));
    res.render("project", { c: await C(res), project: pv, others: others.map(view), page: "work" });
  } catch (e) { next(e); }
});

app.get("/services", async (_req, res, next) => {
  try {
    res.render("services", {
      c: await C(res),
      services: (await store.listServices({ publishedOnly: true })).map((s) => ({ ...s, _title: loc(res, s, "title"), _desc: loc(res, s, "description") })),
      page: "services",
    });
  } catch (e) { next(e); }
});

app.get("/about", async (_req, res, next) => {
  try {
    res.render("about", { c: await C(res), page: "about" });
  } catch (e) { next(e); }
});

app.get("/contact", async (req, res, next) => {
  try {
    res.render("contact", { c: await C(res), page: "contact", sent: req.query.sent === "1", error: "" });
  } catch (e) { next(e); }
});

app.post("/contact", contactLimiter, async (req, res, next) => {
  try {
    const locale = res.locals.locale;
    const name = esc(req.body.name).trim().slice(0, 120);
    const email = esc(req.body.email).trim().slice(0, 160);
    const message = esc(req.body.message).trim().slice(0, 5000);
    const wantsJson = (req.headers.accept || "").includes("application/json");
    const fail = (msg) => {
      if (wantsJson) return res.status(400).json({ ok: false, error: msg });
      return C(res)
        .then((c) => res.status(400).render("contact", { c, page: "contact", sent: false, error: msg }))
        .catch(next);
    };
    if (!name || !email || !message) return fail(t("err_contact_required", locale));
    if (!validator.isEmail(email)) return fail(t("err_contact_email", locale));
    await store.createMessage({ name, email, message });
    if (wantsJson) return res.json({ ok: true });
    return res.redirect("/contact?sent=1");
  } catch (e) { next(e); }
});

/* public JSON API (read-only) */
app.get("/favicon.ico", (_req, res) => res.status(204).end());
app.get("/api/projects", async (_req, res, next) => {
  try { res.json({ ok: true, projects: await store.listProjects({ publishedOnly: true }) }); }
  catch (e) { next(e); }
});
app.get("/api/announcements", async (_req, res, next) => {
  try { res.json({ ok: true, announcements: await store.listAnnouncements({ publishedOnly: true }) }); }
  catch (e) { next(e); }
});

/* ============================================================
   ADMIN AUTH
============================================================ */
app.get("/admin/login", (req, res) => {
  if (req.session.adminId) return res.redirect("/admin");
  res.render("admin/login", { error: "" });
});
app.post("/admin/login", loginLimiter, async (req, res, next) => {
  try {
    const locale = res.locals.locale;
    const email = esc(req.body.email).trim().toLowerCase();
    const password = esc(req.body.password);
    const user = await store.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).render("admin/login", { error: t("login_bad", locale) });
    }
    req.session.adminId = user.id;
    res.redirect("/admin");
  } catch (e) { next(e); }
});
app.post("/admin/logout", (req, res) => {
  req.session = null;
  res.redirect("/admin/login");
});

/* unread message count for the admin sidebar (all admin pages except login) */
app.use("/admin", async (req, res, next) => {
  if (req.path === "/login") return next();
  try { res.locals.unread = await store.unreadCount(); }
  catch { res.locals.unread = 0; }
  next();
});

/* ============================================================
   ADMIN — dashboard & projects
============================================================ */
app.get("/admin", requireAdmin, async (_req, res, next) => {
  try {
    res.render("admin/dashboard", { counts: await store.counts(), recent: (await store.listMessages()).slice(0, 5) });
  } catch (e) { next(e); }
});

app.get("/admin/projects", requireAdmin, async (_req, res, next) => {
  try {
    res.render("admin/projects", { projects: await store.listProjects() });
  } catch (e) { next(e); }
});
app.get("/admin/projects/new", requireAdmin, (_req, res) => {
  res.render("admin/project-form", { project: null, error: "" });
});
app.post("/admin/projects", requireAdmin, upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), async (req, res, next) => {
  try {
    const locale = res.locals.locale;
    const title = esc(req.body.title).trim().slice(0, 160);
    if (!title) return res.status(400).render("admin/project-form", { project: null, error: t("pf_title_required", locale) });
    const slug = await store.uniqueSlug(title);
    const coverPaths = await saveUploads(req.files?.cover || []);
    const galleryPaths = await saveUploads(req.files?.gallery || []);
    const id = await store.createProject({
      title, title_ar: esc(req.body.title_ar).trim().slice(0, 160),
      slug,
      description: esc(req.body.description).trim().slice(0, 20000),
      description_ar: esc(req.body.description_ar).trim().slice(0, 20000),
      category: esc(req.body.category).trim().slice(0, 80),
      category_ar: esc(req.body.category_ar).trim().slice(0, 80),
      cover_image: coverPaths[0] || "",
      published: req.body.published === "1",
      sort_order: parseInt(req.body.sort_order, 10) || 0,
    });
    await store.addProjectImages(id, galleryPaths.map((p, i) => ({ image_path: p, sort_order: i })));
    res.redirect(`/admin/projects/${id}/edit`);
  } catch (e) { next(e); }
});
app.get("/admin/projects/:id/edit", requireAdmin, async (req, res, next) => {
  try {
    const project = await store.getProjectById(req.params.id);
    if (!project) return res.status(404).send(t("err_project_not_found", res.locals.locale));
    res.render("admin/project-form", { project, error: "" });
  } catch (e) { next(e); }
});
app.post("/admin/projects/:id", requireAdmin, upload.fields([{ name: "cover", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), async (req, res, next) => {
  try {
    const locale = res.locals.locale;
    const project = await store.getProjectById(req.params.id);
    if (!project) return res.status(404).send(t("err_project_not_found", locale));
    const title = esc(req.body.title).trim().slice(0, 160);
    if (!title) return res.status(400).render("admin/project-form", { project, error: t("pf_title_required", locale) });
    let cover = project.cover_image;
    const coverPaths = await saveUploads(req.files?.cover || []);
    if (coverPaths[0]) {
      await deleteUpload(cover);
      cover = coverPaths[0];
    }
    await store.updateProject(project.id, {
      title, title_ar: esc(req.body.title_ar).trim().slice(0, 160),
      description: esc(req.body.description).trim().slice(0, 20000),
      description_ar: esc(req.body.description_ar).trim().slice(0, 20000),
      category: esc(req.body.category).trim().slice(0, 80),
      category_ar: esc(req.body.category_ar).trim().slice(0, 80),
      cover_image: cover,
      published: req.body.published === "1",
      sort_order: parseInt(req.body.sort_order, 10) || 0,
    });
    const galleryPaths = await saveUploads(req.files?.gallery || []);
    if (galleryPaths.length) {
      const maxSort = await store.maxImageSort(project.id);
      await store.addProjectImages(project.id, galleryPaths.map((p, i) => ({ image_path: p, sort_order: maxSort + 1 + i })));
    }
    res.redirect(`/admin/projects/${project.id}/edit`);
  } catch (e) { next(e); }
});
app.post("/admin/projects/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    const project = await store.deleteProject(req.params.id);
    if (project) {
      await deleteUpload(project.cover_image);
      for (const im of project.images || []) await deleteUpload(im.image_path);
    }
    res.redirect("/admin/projects");
  } catch (e) { next(e); }
});
app.post("/admin/projects/:id/toggle", requireAdmin, async (req, res, next) => {
  try { await store.toggleProjectPublish(req.params.id); res.redirect("/admin/projects"); }
  catch (e) { next(e); }
});
app.post("/admin/projects/:id/cover-clear", requireAdmin, async (req, res, next) => {
  try {
    const project = await store.getProjectById(req.params.id);
    if (project) {
      await deleteUpload(project.cover_image);
      await store.updateProject(project.id, { ...project, cover_image: "" });
    }
    res.redirect(`/admin/projects/${req.params.id}/edit`);
  } catch (e) { next(e); }
});
app.post("/admin/images/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    const img = await store.deleteProjectImage(req.params.id);
    if (img) {
      await deleteUpload(img.image_path);
      return res.redirect(`/admin/projects/${img.project_id}/edit`);
    }
    res.redirect("/admin/projects");
  } catch (e) { next(e); }
});
app.post("/admin/images/:id/caption", requireAdmin, async (req, res, next) => {
  try {
    const img = await store.getProjectImage(req.params.id);
    if (img) {
      await store.updateProjectImageCaption(img.id, esc(req.body.caption).trim().slice(0, 200), esc(req.body.caption_ar).trim().slice(0, 200));
      return res.redirect(`/admin/projects/${img.project_id}/edit`);
    }
    res.redirect("/admin/projects");
  } catch (e) { next(e); }
});

/* ============================================================
   ADMIN — services
============================================================ */
app.get("/admin/services", requireAdmin, async (req, res, next) => {
  try {
    const editing = req.query.edit ? await store.getService(req.query.edit) : null;
    res.render("admin/services", { services: await store.listServices(), editing: editing || null });
  } catch (e) { next(e); }
});
app.post("/admin/services", requireAdmin, async (req, res, next) => {
  try {
    const title = esc(req.body.title).trim().slice(0, 160);
    if (!title) return res.redirect("/admin/services");
    const data = {
      title, title_ar: esc(req.body.title_ar).trim().slice(0, 160),
      description: esc(req.body.description).trim().slice(0, 5000),
      description_ar: esc(req.body.description_ar).trim().slice(0, 5000),
      published: req.body.published === "1",
      sort_order: parseInt(req.body.sort_order, 10) || 0,
    };
    if (req.body.id) await store.updateService(req.body.id, data);
    else await store.createService(data);
    res.redirect("/admin/services");
  } catch (e) { next(e); }
});
app.post("/admin/services/:id/delete", requireAdmin, async (req, res, next) => {
  try { await store.deleteService(req.params.id); res.redirect("/admin/services"); }
  catch (e) { next(e); }
});
app.post("/admin/services/:id/toggle", requireAdmin, async (req, res, next) => {
  try { await store.toggleService(req.params.id); res.redirect("/admin/services"); }
  catch (e) { next(e); }
});

/* ============================================================
   ADMIN — announcements
============================================================ */
app.get("/admin/announcements", requireAdmin, async (req, res, next) => {
  try {
    const editing = req.query.edit ? await store.getAnnouncement(req.query.edit) : null;
    res.render("admin/announcements", { announcements: await store.listAnnouncements(), editing: editing || null });
  } catch (e) { next(e); }
});
app.post("/admin/announcements", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    const title = esc(req.body.title).trim().slice(0, 200);
    if (!title) return res.redirect("/admin/announcements");
    const paths = await saveUploads(req.file ? [req.file] : []);
    const data = {
      title, title_ar: esc(req.body.title_ar).trim().slice(0, 200),
      body: esc(req.body.body).trim().slice(0, 10000),
      body_ar: esc(req.body.body_ar).trim().slice(0, 10000),
      published: req.body.published === "1",
    };
    if (req.body.id) {
      const old = await store.getAnnouncement(req.body.id);
      const img = paths[0] || (old ? old.image_path : "");
      if (paths[0] && old && old.image_path) await deleteUpload(old.image_path);
      await store.updateAnnouncement(req.body.id, { ...data, image_path: img });
    } else {
      await store.createAnnouncement({ ...data, image_path: paths[0] || "" });
    }
    res.redirect("/admin/announcements");
  } catch (e) { next(e); }
});
app.post("/admin/announcements/:id/delete", requireAdmin, async (req, res, next) => {
  try {
    const a = await store.deleteAnnouncement(req.params.id);
    if (a) await deleteUpload(a.image_path);
    res.redirect("/admin/announcements");
  } catch (e) { next(e); }
});
app.post("/admin/announcements/:id/toggle", requireAdmin, async (req, res, next) => {
  try { await store.toggleAnnouncement(req.params.id); res.redirect("/admin/announcements"); }
  catch (e) { next(e); }
});

/* ============================================================
   ADMIN — site content & messages
============================================================ */
const CONTENT_FIELDS = [
  ["hero_kicker", "cf_kicker", 1], ["hero_title", "cf_title", 1], ["hero_subtitle", "cf_subtitle", 1],
  ["hero_cta_primary", "cf_cta_primary", 1], ["hero_cta_secondary", "cf_cta_secondary", 1],
  ["about_title", "cf_about_title", 1], ["about_body", "cf_about_body", 1],
  ["about_years", "cf_years", 1], ["about_projects_label", "cf_years_label", 1],
  ["services_title", "cf_services_title", 1], ["services_subtitle", "cf_services_subtitle", 1],
  ["work_title", "cf_work_title", 1], ["work_subtitle", "cf_work_subtitle", 1],
  ["contact_title", "cf_contact_title", 1], ["contact_subtitle", "cf_contact_subtitle", 1],
  ["whatsapp_url", "cf_whatsapp", 0], ["facebook_url", "cf_facebook", 0],
  ["footer_tagline", "cf_tagline", 1],
];
const CONTENT_GROUPS = [
  ["content_hero", ["hero_kicker", "hero_title", "hero_subtitle", "hero_cta_primary", "hero_cta_secondary"]],
  ["content_about", ["about_title", "about_body", "about_years", "about_projects_label"]],
  ["content_sections", ["services_title", "services_subtitle", "work_title", "work_subtitle", "contact_title", "contact_subtitle"]],
  ["content_links", ["whatsapp_url", "facebook_url", "footer_tagline"]],
];
app.get("/admin/content", requireAdmin, async (req, res, next) => {
  try {
    const raw = await store.getAllContentRaw();
    res.render("admin/content", {
      fields: CONTENT_FIELDS, groups: CONTENT_GROUPS, raw,
      saved: req.query.saved === "1",
    });
  } catch (e) { next(e); }
});
app.post("/admin/content", requireAdmin, async (req, res, next) => {
  try {
    const entries = {};
    for (const [key, , hasAr] of CONTENT_FIELDS) {
      if (key in req.body) entries[key] = esc(req.body[key]).slice(0, 20000);
      if (hasAr && key + "__ar" in req.body) entries[key + "__ar"] = esc(req.body[key + "__ar"]).slice(0, 20000);
    }
    await store.setContent(entries);
    res.redirect("/admin/content?saved=1");
  } catch (e) { next(e); }
});

app.get("/admin/messages", requireAdmin, async (req, res, next) => {
  try {
    res.render("admin/messages", { messages: await store.listMessages() });
  } catch (e) { next(e); }
});
app.post("/admin/messages/:id/read", requireAdmin, async (req, res, next) => {
  try { await store.markMessageRead(req.params.id); res.redirect("/admin/messages"); }
  catch (e) { next(e); }
});
app.post("/admin/messages/:id/delete", requireAdmin, async (req, res, next) => {
  try { await store.deleteMessage(req.params.id); res.redirect("/admin/messages"); }
  catch (e) { next(e); }
});

/* 404 + error handlers */
app.use(async (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ ok: false, error: t("err_not_found", res.locals.locale) });
  res.status(404).render("404", { c: await contentFor(res.locals.locale), page: "" });
});
// eslint-disable-next-line no-unused-vars
app.use(async (err, _req, res, _next) => {
  console.error(err);
  const locale = res.locals.locale || "en";
  if (err && err.code === "LIMIT_FILE_SIZE") return res.status(413).send(t("err_413", locale));
  try {
    res.status(500).render("500", { c: await contentFor(locale), page: "" });
  } catch {
    res.status(500).send("Error");
  }
});

/* boot: seed content/services/admin, then serve */
const ready = (async () => {
  await seed();
  console.log(`[dana-jo] ready · store=${USE_BLOB ? "vercel-blob" : "sqlite"} · uploads=${USE_BLOB ? "vercel-blob" : "disk"}`);
})();

if (require.main === module) {
  ready.then(() => {
    app.listen(PORT, () => console.log(`Dana Jo portfolio running on http://localhost:${PORT}`));
  }).catch((e) => {
    console.error("Boot failed:", e);
    process.exit(1);
  });
}

module.exports = { app, ready };
