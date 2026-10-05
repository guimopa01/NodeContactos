const prisma = require('./db');

async function initDb() {
  await prisma.$connect();
  console.log('✅ Conexión de Prisma a PostgreSQL establecida.');
}

module.exports = initDb;
