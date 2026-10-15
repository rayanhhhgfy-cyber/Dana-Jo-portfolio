"use strict";
/* Ensures default content and the admin user exist. Reads ADMIN_EMAIL /
   ADMIN_PASSWORD from env (env = source of truth). Safe to run repeatedly. */
const { seed, syncAdminUser } = require("../lib/store");

(async () => {
  await seed();
  await syncAdminUser();
  console.log("Seed complete. Login at /admin/login");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
