require('dotenv').config();

const path = require('path');
const { spawnSync } = require('child_process');
const getDatabaseUrl = require('./databaseUrl');

const prismaCli = require.resolve('prisma/build/index.js');
const action = process.argv[2] || 'push';
const commands = {
  push: ['db', 'push'],
  generate: ['generate'],
  studio: ['studio', '--port', '5555']
};

if (!commands[action]) {
  console.error(`❌ Acción Prisma desconocida: ${action}`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [prismaCli, ...commands[action], '--schema', path.join(__dirname, '..', 'prisma', 'schema.prisma')],
  {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: getDatabaseUrl() }
  }
);

if (result.error) {
  console.error('❌ No se pudo ejecutar la sincronización del esquema Prisma:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status || 1);
}
