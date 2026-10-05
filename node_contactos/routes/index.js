var express = require('express');
var router = express.Router();

/* GET home page: Muestra la pantalla de inicio con opciones de Iniciar Sesión y Registro */
router.get('/', function(req, res) {
  res.render('index', { title: 'NodeContactos - Inicio' });
});

module.exports = router;


