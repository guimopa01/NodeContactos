const prisma = require('../config/db');
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
      const user = await prisma.usuario.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } }
      });

      if (!user) {
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
        email: user.email,
        provincia_id: user.provinciaId
      };

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ status: 'success', message: 'Sesión iniciada', user: req.session.user });
      }

      res.redirect('/');
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
  async formularioRegister(req, res) {
    try {
      const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
      res.render('auth/register', {
        title: 'Registrarse',
        error: null,
        formData: {},
        provincias
      });
    } catch (error) {
      console.error('Error al cargar provincias para el registro:', error);
      res.status(500).render('error', { message: 'Error al cargar el formulario de registro', error });
    }
  },

  // POST /auth/register - Procesar registro de usuario
  async register(req, res) {
    let provincias = [];

    try {
      const { nombre, email, password, confirmPassword, provincia_id } = req.body;
      const formData = { nombre, email, provincia_id };
      provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });

      if (!nombre || !email || !password || !confirmPassword || !provincia_id) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'Todos los campos, incluida la provincia, son obligatorios.',
          formData,
          provincias
        });
      }

      const provinciaId = Number(provincia_id);
      if (!Number.isInteger(provinciaId) || provinciaId < 1 ||
          !provincias.some((provincia) => provincia.id === provinciaId)) {
        return res.status(400).render('auth/register', {
          title: 'Registrarse',
          error: 'Selecciona una provincia válida.',
          formData,
          provincias
        });
      }

      if (password !== confirmPassword) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'Las contraseñas no coinciden.',
          formData,
          provincias
        });
      }

      if (password.length < 6) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'La contraseña debe tener al menos 6 caracteres.',
          formData,
          provincias
        });
      }

      // Verificar si ya existe un usuario con ese email
      const existing = await prisma.usuario.findFirst({
        where: { email: { equals: email.trim(), mode: 'insensitive' } },
        select: { id: true }
      });
      if (existing) {
        return res.render('auth/register', {
          title: 'Registrarse',
          error: 'El correo electrónico ya está registrado. Intenta iniciar sesión.',
          formData,
          provincias
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insertar nuevo usuario
      const newUser = await prisma.usuario.create({
        data: {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          provinciaId
        },
        select: { id: true, nombre: true, email: true, provinciaId: true }
      });

      // Iniciar sesión automáticamente
      req.session.user = {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        provincia_id: newUser.provinciaId
      };

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(201).json({ status: 'success', message: 'Registro exitoso', user: req.session.user });
      }

      res.redirect('/');
    } catch (error) {
      console.error('Error en el registro:', error);
      res.status(500).render('auth/register', {
        title: 'Registrarse',
        error: 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.',
        formData: {
          nombre: req.body.nombre,
          email: req.body.email,
          provincia_id: req.body.provincia_id
        },
        provincias
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
