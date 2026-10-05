// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(401).json({ status: 'error', message: 'No autorizado. Debe iniciar sesión.' });
  }

  res.redirect('/auth/login?error=' + encodeURIComponent('Debes iniciar sesión para acceder.'));
}

function guestOnly(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect('/contactos');
  }
  next();
}

module.exports = {
  requireAuth,
  guestOnly
};
