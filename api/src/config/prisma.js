require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não encontrada. Confira o arquivo api/.env.");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;