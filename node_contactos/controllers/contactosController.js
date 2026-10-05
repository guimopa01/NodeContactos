const prisma = require('../config/db');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseProvinciaId(value) {
  return parseId(value);
}

function esPeticionJson(req) {
  return req.xhr || req.headers.accept?.includes('json');
}

function responderProvinciaInvalida(req, res) {
  if (esPeticionJson(req)) {
    return res.status(400).json({ status: 'error', message: 'Selecciona una provincia válida' });
  }
  return res.status(400).render('error', {
    message: 'Selecciona una provincia válida.',
    error: {}
  });
}

function responderCamposObligatorios(req, res) {
  if (esPeticionJson(req)) {
    return res.status(400).json({
      status: 'error',
      message: 'El nombre y la provincia son obligatorios'
    });
  }
  return res.status(400).render('error', {
    message: 'El nombre y la provincia son obligatorios.',
    error: {}
  });
}

function responderNoEncontrado(req, res) {
  if (esPeticionJson(req)) {
    return res.status(404).json({ status: 'error', message: 'Contacto no encontrado' });
  }
  return res.status(404).render('error', {
    message: 'Contacto no encontrado',
    error: {}
  });
}

const contactosController = {
  async detalle(req, res) {
    try {
      const id = parseId(req.params.id);
      const contacto = id && await prisma.contacto.findUnique({
        where: { id },
        include: { provincia: true }
      });

      if (!contacto) {
        return responderNoEncontrado(req, res);
      }

      const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
      res.render('contactos/detalle', {
        title: 'Detalle del contacto',
        contacto: {
          ...contacto,
          provincia_id: contacto.provinciaId,
          provincia: contacto.provincia.nombre
        },
        provincias
      });
    } catch (error) {
      console.error('Error al cargar el detalle del contacto:', error);
      res.status(500).render('error', { message: 'Error al cargar el contacto', error });
    }
  },

  async listar(req, res) {
    try {
      const contactos = await prisma.contacto.findMany({
        include: { provincia: true },
        orderBy: { id: 'asc' }
      });
      const data = contactos.map((contacto) => ({
        ...contacto,
        provincia_id: contacto.provinciaId,
        provincia: contacto.provincia.nombre
      }));

      if (esPeticionJson(req)) {
        return res.json({ status: 'success', data });
      }

      res.render('contactos/index', {
        title: 'Lista de Contactos',
        contactos: data
      });
    } catch (error) {
      console.error('Error al listar contactos:', error);
      res.status(500).render('error', { message: 'Error al obtener contactos', error });
    }
  },

  async formularioNuevo(req, res) {
    try {
      const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
      res.render('contactos/form', {
        title: 'Nuevo Contacto',
        contacto: null,
        provincias
      });
    } catch (error) {
      console.error('Error al cargar formulario:', error);
      res.status(500).render('error', { message: 'Error al cargar formulario', error });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, telefono, email, provincia_id } = req.body;
      const provinciaId = parseProvinciaId(provincia_id);

      if (!nombre || !provinciaId) {
        return responderCamposObligatorios(req, res);
      }

      const provincia = await prisma.provincia.findUnique({ where: { id: provinciaId } });
      if (!provincia) {
        return responderProvinciaInvalida(req, res);
      }

      const contacto = await prisma.contacto.create({
        data: {
          nombre: nombre.trim(),
          telefono: telefono || null,
          email: email || null,
          provinciaId
        }
      });

      if (esPeticionJson(req)) {
        return res.status(201).json({ status: 'success', data: contacto });
      }

      res.redirect('/');
    } catch (error) {
      console.error('Error al crear contacto:', error);
      res.status(500).render('error', { message: 'Error al crear contacto', error });
    }
  },

  async formularioEditar(req, res) {
    try {
      const id = parseId(req.params.id);
      const contacto = id && await prisma.contacto.findUnique({ where: { id } });

      if (!contacto) {
        return responderNoEncontrado(req, res);
      }

      const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
      res.render('contactos/form', {
        title: 'Editar Contacto',
        contacto: { ...contacto, provincia_id: contacto.provinciaId },
        provincias
      });
    } catch (error) {
      console.error('Error al cargar contacto para editar:', error);
      res.status(500).render('error', { message: 'Error al cargar contacto', error });
    }
  },

  async actualizar(req, res) {
    try {
      const id = parseId(req.params.id);
      const { nombre, telefono, email, provincia_id } = req.body;
      const provinciaId = parseProvinciaId(provincia_id);

      if (!id) {
        return responderNoEncontrado(req, res);
      }
      if (!nombre || !provinciaId) {
        return responderCamposObligatorios(req, res);
      }

      const provincia = await prisma.provincia.findUnique({ where: { id: provinciaId } });
      if (!provincia) {
        return responderProvinciaInvalida(req, res);
      }

      const contacto = await prisma.contacto.update({
        where: { id },
        data: {
          nombre: nombre.trim(),
          telefono: telefono || null,
          email: email || null,
          provinciaId
        }
      });

      if (esPeticionJson(req)) {
        return res.json({ status: 'success', data: contacto });
      }

      res.redirect('/');
    } catch (error) {
      if (error.code === 'P2025') {
        return responderNoEncontrado(req, res);
      }
      console.error('Error al actualizar contacto:', error);
      res.status(500).render('error', { message: 'Error al actualizar contacto', error });
    }
  },

  async eliminar(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return responderNoEncontrado(req, res);
      }

      await prisma.contacto.delete({ where: { id } });

      if (esPeticionJson(req)) {
        return res.json({ status: 'success', message: 'Contacto eliminado correctamente' });
      }

      res.redirect('/');
    } catch (error) {
      if (error.code === 'P2025') {
        return responderNoEncontrado(req, res);
      }
      console.error('Error al eliminar contacto:', error);
      res.status(500).render('error', { message: 'Error al eliminar contacto', error });
    }
  },

  async listarProvincias(req, res) {
    try {
      const provincias = await prisma.provincia.findMany({ orderBy: { nombre: 'asc' } });
      res.json({ status: 'success', data: provincias });
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      res.status(500).json({ status: 'error', message: 'Error al obtener provincias' });
    }
  }
};

module.exports = contactosController;
