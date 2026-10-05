const express = require('express');
const router = express.Router();
const contactosController = require('../controllers/contactosController');

// Rutas de contactos
router.get('/', contactosController.listar);
router.get('/nuevo', contactosController.formularioNuevo);
router.post('/', contactosController.crear);
router.get('/editar/:id', contactosController.formularioEditar);
router.post('/editar/:id', contactosController.actualizar);
router.put('/:id', contactosController.actualizar);
router.post('/eliminar/:id', contactosController.eliminar);
router.delete('/:id', contactosController.eliminar);

// Ruta para obtener la lista de provincias
router.get('/provincias', contactosController.listarProvincias);

module.exports = router;
