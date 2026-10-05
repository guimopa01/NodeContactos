const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { guestOnly } = require('../middlewares/authMiddleware');

// Rutas de Login
router.get('/login', guestOnly, authController.formularioLogin);
router.post('/login', guestOnly, authController.login);

// Rutas de Registro
router.get('/register', guestOnly, authController.formularioRegister);
router.post('/register', guestOnly, authController.register);

// Rutas de Logout
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
