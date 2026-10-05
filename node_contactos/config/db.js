const { PrismaClient } = require('@prisma/client');
const getDatabaseUrl = require('./databaseUrl');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

module.exports = prisma;
