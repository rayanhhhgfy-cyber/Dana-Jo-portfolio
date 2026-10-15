"use strict";
/* Pure helpers with no side effects (safe to require anywhere, incl. serverless). */

function slugify(title) {
  return (
    String(title || "")
      .toLowerCase()
      .trim()
      .replace(/[''"]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "project"
  );
}

function nowIso() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function esc(s) {
  return String(s == null ? "" : s);
}

function parseCookies(req) {
  const out = {};
  const h = req.headers.cookie || "";
  for (const part of h.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); }
    catch { out[k] = part.slice(i + 1).trim(); }
  }
  return out;
}

module.exports = { slugify, nowIso, esc, parseCookies };
