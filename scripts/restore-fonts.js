"use strict";
/* Restores self-hosted woff2 fonts from the chunked base64 manifests committed to the repo.
   Binary .woff2 files are git-ignored (GitHub MCP push is text-only), so this runs
   on `postinstall` (local clone + Vercel build) to recreate them byte-identically.
   Each public/fonts/fontdata-N.json is {name, part, of, data}; chunks are joined in order. */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "fonts");

try {
  const groups = new Map();
  for (const f of fs.readdirSync(dir)) {
    if (!/^fontdata-\d+\.json$/.test(f)) continue;
    const { name, part, of, data } = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (!groups.has(name)) groups.set(name, new Array(of).fill(null));
    groups.get(name)[part] = data;
  }
  let restored = 0;
  for (const [name, chunks] of groups) {
    if (chunks.some((c) => c == null)) throw new Error(`missing chunk for ${name}`);
    const buf = Buffer.from(chunks.join(""), "base64");
    const dest = path.join(dir, name);
    let write = true;
    try {
      if (fs.readFileSync(dest).equals(buf)) write = false;
    } catch { /* missing — write it */ }
    if (write) {
      fs.writeFileSync(dest, buf);
      restored++;
    }
  }
  console.log(`[dana-jo] fonts ready (${groups.size} files, ${restored} written)`);
} catch (e) {
  console.error("[dana-jo] font restore failed:", e.message);
  process.exit(1);
}
