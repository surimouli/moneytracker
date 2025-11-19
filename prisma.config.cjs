// prisma.config.cjs
require('dotenv').config();        // ⬅️ load .env manually

const path = require('path');
const { defineConfig } = require('prisma/config');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing from .env');
  process.exit(1);
}

module.exports = defineConfig({
  engine: 'classic',

  schema: path.join('prisma', 'schema.prisma'),

  migrations: {
    path: path.join('prisma', 'migrations'),
  },

  datasource: {
    // Use the value we just loaded from .env
    url: process.env.DATABASE_URL,
  },
});
