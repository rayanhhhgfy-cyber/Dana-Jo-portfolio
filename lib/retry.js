"use strict";
/* Retry helper for transient Blob/network failures.
   Vercel serverless functions talk to Blob storage over HTTPS —
   occasional blips must not surface as 500s to the admin. */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* fn: async function. Retries on any throw, with exponential backoff.
   Rethrows the last error after `tries` attempts. */
async function withRetry(fn, tries = 3, baseMs = 350) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i < tries - 1) await sleep(baseMs * Math.pow(2, i) + Math.random() * 120);
    }
  }
  throw last;
}

/* Per-key promise-chain mutex. Serializes async read-modify-write
   sequences so concurrent admin actions on one instance can't
   clobber each other's Blob documents. */
const chains = new Map();
function withLock(key, fn) {
  const prev = chains.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  chains.set(key, next.catch(() => {}));
  return next;
}

module.exports = { withRetry, withLock, sleep };
