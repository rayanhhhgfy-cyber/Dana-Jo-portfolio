"use strict";
/* Upload storage abstraction.
   Blob mode (BLOB_READ_WRITE_TOKEN set): files go to Vercel Blob, public URLs.
   Disk mode (local dev): files go to public/uploads, served as /uploads/*. */
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { withRetry } = require("./retry");

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

if (!USE_BLOB) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

function randomName(mimetype, originalname) {
  let ext = EXT_BY_MIME[mimetype] || "";
  if (!ext) {
    ext = path.extname(originalname || "").toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) ext = ".jpg";
    if (ext === ".jpeg") ext = ".jpg";
  }
  return Date.now() + "-" + crypto.randomBytes(8).toString("hex") + ext;
}

/* files: multer memory-storage file objects -> array of stored paths/URLs */
async function saveUploads(files) {
  const list = files || [];
  if (!list.length) return [];
  if (USE_BLOB) {
    const { put } = require("@vercel/blob");
    const out = [];
    for (const f of list) {
      const name = randomName(f.mimetype, f.originalname);
      const blob = await withRetry(() => put("uploads/" + name, f.buffer, {
        access: "public",
        contentType: f.mimetype,
        addRandomSuffix: false,
      }));
      out.push(blob.url);
    }
    return out;
  }
  const out = [];
  for (const f of list) {
    const name = randomName(f.mimetype, f.originalname);
    fs.writeFileSync(path.join(UPLOAD_DIR, name), f.buffer);
    out.push("/uploads/" + name);
  }
  return out;
}

async function deleteUpload(p) {
  if (!p) return;
  try {
    if (/^https?:\/\//.test(p)) {
      if (USE_BLOB) {
        const { del } = require("@vercel/blob");
        await withRetry(() => del(p), 2);
      }
      return;
    }
    if (!p.startsWith("/uploads/")) return;
    const full = path.join(__dirname, "..", "public", p);
    fs.unlink(full, () => {});
  } catch {}
}

function diskFile(p) {
  // remove a just-written disk file (validation failure cleanup)
  if (!p || /^https?:\/\//.test(p) || !p.startsWith("/uploads/")) return;
  fs.unlink(path.join(__dirname, "..", "public", p), () => {});
}

module.exports = { saveUploads, deleteUpload, diskFile, USE_BLOB };
