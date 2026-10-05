const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const authController = {
  // GET /auth/login - Formulario de inicio de sesión
  formularioLogin(req, res) {
    const error = req.query.error || null;
    const success = req.query.success || null;
    res.render('auth/login', {
      title: 'Iniciar Sesión',
      error,
      success
    });
  },

  // POST /auth/login - Procesar inicio de sesión
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        if (req.xhr || req.headers.accept?.includes('json')) {
          return res.status(400).json({ status: 'error', message: 'Por favor completa todos los campos' });
        }
        return res.render('auth/login', {
          title: 'Iniciar Sesión',
          error: 'Por favor ingresa tu correo y contraseña.',
          success: null,
          email
        });
      }

      // Buscar usuario en la base de datos
      const result = await pool.query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);

      if (result.rows.length === 0) {
        if (req.xhr || req.headers.accept?.includes('json')) {
          return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }
        return res.render('auth/login', {
          title: 'Iniciar Sesión',
          error: 'El correo electrónico o la contraseña son incorrectos.',
          success: null,
          email
        });
      }

      const user = result.rows[0];

      // Verificar contraseña
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        if (req.xhr || req.headers.accept?.includes('json')) {
          return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }
        return res.render('auth/login', {
          title: 'Iniciar Sesión',
          error: 'El correo electrónico o la contraseña son incorrectos.',
          success: null,
          email
        });
      }

      // Guardar sesión del usuario
      req.session.user = {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      };

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ status: 'success', message: 'Sesión iniciada', user: req.session.user });
      }

      res.redirect('/contactos');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).render('auth/login', {
        title: 'Iniciar Sesión',
        error: 'Ocurrió un error en el servidor. Inténtalo de nuevo.',
        success: null,
        email: req.body.email
      });
    }
  },

  // GET /auth/register - Formulario de registro
  formularioRegister(req, res) {
    res.render('auth/register', {
      title: 'Registrarse',
      error: null,
      formData: {}
    });
  },

  // POST /auth/register - Procesar registro de usuario
  async register(req, res) {
    try {
      const { nombre, email, password, confirmPassword } = req.body;
      const formData = { nombre, email };

      if (!nombre || !email || !password || !confirmPassword) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'Todos los campos son obligatorios.',
          formData
        });
      }

      if (password !== confirmPassword) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'Las contraseñas no coinciden.',
          formData
        });
      }

      if (password.length < 6) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'La contraseña debe tener al menos 6 caracteres.',
          formData
        });
      }

      // Verificar si ya existe un usuario con ese email
      const existing = await pool.query('SELECT id FROM usuarios WHERE LOWER(email) = LOWER($1)', [email.trim()]);
      if (existing.rows.length > 0) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'El correo electrónico ya está registrado. Intenta iniciar sesión.',
          formData
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insertar nuevo usuario
      const insertResult = await pool.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
        [nombre.trim(), email.trim().toLowerCase(), hashedPassword]
      );

      const newUser = insertResult.rows[0];

      // Iniciar sesión automáticamente
      req.session.user = {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email
      };

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(201).json({ status: 'success', message: 'Registro exitoso', user: req.session.user });
      }

      res.redirect('/contactos');
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).render('auth/register', {
        title: 'Registrarse',
        error: 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.',
        formData: { nombre: req.body.nombre, email: req.body.email }
      });
    }
  },

  // GET & POST /auth/logout - Cerrar sesión
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/auth/login?success=' + encodeURIComponent('Has cerrado sesión correctamente.'));
    });
  }
};

module.exports = authController;
