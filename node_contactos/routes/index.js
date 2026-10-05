var express = require('express');
var router = express.Router();

var contactosController = require('../controllers/contactosController');

/* GET home page: muestra la lista de contactos */
router.get('/', contactosController.listar);

module.exports = router;
