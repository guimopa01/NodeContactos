const pool = require('./db');

async function initDb() {
  try {
    // 1. Crear tabla de provincias (1 provincia -> N contactos)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provincias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE
      );
    `);

    // 2. Crear tabla de contactos con clave foránea a provincias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(100),
        provincia_id INT REFERENCES provincias(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const resProvincias = await pool.query('SELECT COUNT(*) FROM provincias');
    if (parseInt(resProvincias.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO provincias (nombre) VALUES 
        ('Buenos Aires'),
        ('Córdoba'),
        ('Santa Fe'),
        ('Mendoza'),
        ('Tucumán'),
        ('Entre Ríos'),
        ('Salta'),
        ('Misiones'),
        ('Chaco'),
        ('Corrientes');
      `);
      console.log('✅ Provincias iniciales creadas en la base de datos.');
    }

    // 4. Insertar contactos de muestra si la tabla está vacía
    const resContactos = await pool.query('SELECT COUNT(*) FROM contactos');
    if (parseInt(resContactos.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO contactos (nombre, telefono, email, provincia_id) VALUES
        ('Carlos Gómez', '+54 11 4455-6677', 'carlos.gomez@email.com', 1),
        ('María Rodríguez', '+54 351 987-6543', 'maria.rodriguez@email.com', 2),
        ('Juan Pérez', '+54 341 555-1234', 'juan.perez@email.com', 3);
      `);
      console.log('✅ Contactos de prueba creados.');
    }

    console.log('✅ Tablas "provincias" y "contactos" listas.');
  } catch (error) {
    console.error('❌ Error al inicializar las tablas de la base de datos:', error.message);
  }
}

module.exports = initDb;
