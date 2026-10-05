require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contactosRouter = require('./routes/contactos');
var authRouter = require('./routes/auth');
var { requireAuth } = require('./middlewares/authMiddleware');
var initDb = require('./config/initDb');

var app = express();

// El servidor espera a que PostgreSQL y las tablas estén listas antes de arrancar.
app.locals.dbReady = initDb();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'node_contactos_secret_key_12345',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware global para exponer los datos del usuario en res.locals
app.use(function(req, res, next) {
  res.locals.user = req.session ? req.session.user : null;
  next();
});

// Rutas de autenticación (tanto en /auth como accesos directos /login, /register, /logout)
app.use('/auth', authRouter);
app.use('/', authRouter);

// Rutas principales y protegidas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contactos', requireAuth, contactosRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
