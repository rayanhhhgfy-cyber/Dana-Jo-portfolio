"use strict";
/* Vercel serverless entry — wraps the Express app.
   Storage: Vercel Blob JSON store (BLOB_READ_WRITE_TOKEN auto-injected
   when the Blob store is connected to the project). */
const { app, ready } = require("../server");

module.exports = async (req, res) => {
  await ready;
  app(req, res);
};
