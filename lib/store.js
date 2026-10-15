"use strict";
/* Repository picker + boot seeding.
   Backend: Vercel Blob JSON store when BLOB_READ_WRITE_TOKEN is set,
   otherwise local SQLite. The app talks only to this module's async API. */
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { DEFAULT_CONTENT, DEFAULT_CONTENT_AR, DEFAULT_SERVICES, DEFAULT_SERVICES_AR } = require("./content-defaults");
const { L } = require("./i18n");

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const store = USE_BLOB ? require("./store-blob") : require("./store-sqlite");

/* Localized site-content map for templates: c.hero_title etc. follow the
   active locale, falling back to English when the Arabic value is empty. */
async function contentFor(locale) {
  const raw = await store.getAllContentRaw();
  const out = {};
  for (const k of Object.keys(DEFAULT_CONTENT)) {
    const arKey = k + "__ar";
    out[k] = locale === "ar" && raw[arKey] ? raw[arKey] : (raw[k] != null ? raw[k] : DEFAULT_CONTENT[k]);
  }
  // URLs are locale-independent
  out.whatsapp_url = raw.whatsapp_url || DEFAULT_CONTENT.whatsapp_url;
  out.facebook_url = raw.facebook_url || DEFAULT_CONTENT.facebook_url;
  return out;
}

function localized(row, field, locale) {
  return L(row, field, locale);
}

/* Seed default content + services on first boot (both languages). */
async function seed() {
  const raw = await store.getAllContentRaw();
  if (Object.keys(raw).length === 0) {
    const entries = {};
    for (const [k, v] of Object.entries(DEFAULT_CONTENT)) {
      entries[k] = v;
      if (DEFAULT_CONTENT_AR[k]) entries[k + "__ar"] = DEFAULT_CONTENT_AR[k];
    }
    await store.setContent(entries);
  } else {
    // backfill Arabic defaults for keys added later
    const missing = {};
    for (const [k, v] of Object.entries(DEFAULT_CONTENT_AR)) {
      if (!raw[k + "__ar"]) missing[k + "__ar"] = v;
    }
    if (Object.keys(missing).length) await store.setContent(missing);
  }
  const services = await store.listServices();
  if (services.length === 0) {
    for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
      const s = DEFAULT_SERVICES[i];
      const ar = DEFAULT_SERVICES_AR[i] || {};
      await store.createService({
        title: s.title, title_ar: ar.title || "",
        description: s.description, description_ar: ar.description || "",
        published: true, sort_order: s.sort_order,
      });
    }
  } else {
    // backfill Arabic for the original seed services that predate i18n
    for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
      const s = DEFAULT_SERVICES[i];
      const ar = DEFAULT_SERVICES_AR[i] || {};
      const hit = services.find((x) => x.title === s.title && !x.title_ar);
      if (hit) {
        await store.updateService(hit.id, {
          ...hit,
          title_ar: ar.title || hit.title_ar || "",
          description_ar: ar.description || hit.description_ar || "",
        });
      }
    }
  }
  await syncAdminUser();
}

/* Admin user: env is the source of truth (mirrors scripts/seed.js).
   If ADMIN_PASSWORD is missing and no user exists yet, generate a strong
   random one and print it ONCE to the server log (Vercel runtime logs). */
async function syncAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "dana@danajo.design").trim().toLowerCase();
  let password = process.env.ADMIN_PASSWORD;
  let generated = false;
  if (!password) {
    const existing = await store.userCount();
    if (existing > 0) return; // keep whatever is there; operator sets ADMIN_PASSWORD to rotate
    password = crypto.randomBytes(18).toString("base64url");
    generated = true;
  }
  const hash = bcrypt.hashSync(password, 12);
  await store.upsertUser(email, hash);
  if (generated) {
    console.log("[dana-jo] Admin user created.");
    console.log("[dana-jo] Email:    " + email);
    console.log("[dana-jo] Password: " + password);
    console.log("[dana-jo] (generated — copy it now. Set ADMIN_PASSWORD env to change it.)");
  }
}

module.exports = { store, contentFor, localized, seed, syncAdminUser, USE_BLOB };
