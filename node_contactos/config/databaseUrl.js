require('dotenv').config();

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const url = new URL('postgresql://localhost');
  url.username = process.env.DB_USER || 'postgres';
  url.password = process.env.DB_PASSWORD || 'postgres';
  url.hostname = process.env.DB_HOST || 'localhost';
  url.port = process.env.DB_PORT || '5432';
  url.pathname = '/' + (process.env.DB_NAME || 'Contacto');
  url.searchParams.set('schema', 'public');
  return url.toString();
}

module.exports = getDatabaseUrl;
