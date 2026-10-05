const { Pool } = require('pg');
require('dotenv').config();

// Crear el pool de conexiones utilizando las variables de entorno
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Contacto',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

// Probar y verificar la conexión a la base de datos PostgreSQL
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos PostgreSQL:', err.message);
  } else {
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    release();
  }
});

module.exports = pool;
