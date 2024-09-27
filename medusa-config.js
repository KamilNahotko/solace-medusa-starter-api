const { loadEnv, defineConfig } = require("@medusajs/utils");

loadEnv(process.env.NODE_ENV, process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // database_extra: { ssl: { rejectUnauthorized: false } },
    // database_driver_options: {
    //   connection: { ssl: { rejectUnauthorized: false } },
    // },
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
});
