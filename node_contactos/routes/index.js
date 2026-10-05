var express = require('express');
var router = express.Router();
var prisma = require('../config/db');

/* Agenda pública; los datos individuales y las operaciones siguen protegidos. */
router.get('/', async function(req, res) {
  try {
    const result = await prisma.contacto.findMany({
      include: { provincia: { select: { nombre: true, pais: { select: { nombre: true } } } } },
      orderBy: { id: 'asc' }
    });
    res.render('agenda', {
      title: 'Agenda de Contactos',
      contactos: result.map((contacto) => ({
        ...contacto,
        provincia: contacto.provincia.nombre,
        pais: contacto.provincia.pais?.nombre || 'Desconocido'
      }))
    });
  } catch (error) {
    console.error('Error al cargar la agenda:', error);
    res.status(500).render('error', {
      message: 'Error al cargar la agenda de contactos',
      error
    });
  }
});

module.exports = router;
