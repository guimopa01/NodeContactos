const pool = require('../config/db');

// Controller de Contactos y Provincias
const contactosController = {
  
  // GET /contactos - Obtener todos los contactos con su provincia
  async listar(req, res) {
    try {
      const query = `
        SELECT c.id, c.nombre, c.telefono, c.email, c.provincia_id, p.nombre AS provincia
        FROM contactos c
        LEFT JOIN provincias p ON c.provincia_id = p.id
        ORDER BY c.id ASC;
      `;
      const result = await pool.query(query);
      
      // Si la petición acepta JSON o viene de API, responder JSON; de lo contrario renderizar vista
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ status: 'success', data: result.rows });
      }

      res.render('contactos/index', { 
        title: 'Lista de Contactos', 
        contactos: result.rows 
      });
    } catch (error) {
      console.error('Error al listar contactos:', error);
      res.status(500).render('error', { message: 'Error al obtener contactos', error });
    }
  },

  // GET /contactos/nuevo - Formulario para crear un nuevo contacto
  async formularioNuevo(req, res) {
    try {
      const provinciasResult = await pool.query('SELECT * FROM provincias ORDER BY nombre ASC;');
      res.render('contactos/form', {
        title: 'Nuevo Contacto',
        contacto: null,
        provincias: provinciasResult.rows
      });
    } catch (error) {
      console.error('Error al cargar formulario:', error);
      res.status(500).render('error', { message: 'Error al cargar formulario', error });
    }
  },

  // POST /contactos - Crear nuevo contacto
  async crear(req, res) {
    try {
      const { nombre, telefono, email, provincia_id } = req.body;

      if (!nombre) {
        return res.status(400).json({ status: 'error', message: 'El nombre es obligatorio' });
      }

      const query = `
        INSERT INTO contactos (nombre, telefono, email, provincia_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [nombre, telefono || null, email || null, provincia_id ? parseInt(provincia_id, 10) : null];
      const result = await pool.query(query, values);

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(201).json({ status: 'success', data: result.rows[0] });
      }

      res.redirect('/contactos');
    } catch (error) {
      console.error('Error al crear contacto:', error);
      res.status(500).render('error', { message: 'Error al crear contacto', error });
    }
  },

  // GET /contactos/editar/:id - Formulario para editar contacto existente
  async formularioEditar(req, res) {
    try {
      const { id } = req.params;
      const contactoResult = await pool.query('SELECT * FROM contactos WHERE id = $1;', [id]);

      if (contactoResult.rows.length === 0) {
        return res.status(404).render('error', { message: 'Contacto no encontrado', error: {} });
      }

      const provinciasResult = await pool.query('SELECT * FROM provincias ORDER BY nombre ASC;');

      res.render('contactos/form', {
        title: 'Editar Contacto',
        contacto: contactoResult.rows[0],
        provincias: provinciasResult.rows
      });
    } catch (error) {
      console.error('Error al cargar contacto para editar:', error);
      res.status(500).render('error', { message: 'Error al cargar contacto', error });
    }
  },

  // PUT / POST /contactos/editar/:id - Actualizar contacto
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, telefono, email, provincia_id } = req.body;

      const query = `
        UPDATE contactos
        SET nombre = $1, telefono = $2, email = $3, provincia_id = $4
        WHERE id = $5
        RETURNING *;
      `;
      const values = [nombre, telefono || null, email || null, provincia_id ? parseInt(provincia_id, 10) : null, id];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Contacto no encontrado' });
      }

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ status: 'success', data: result.rows[0] });
      }

      res.redirect('/contactos');
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      res.status(500).render('error', { message: 'Error al actualizar contacto', error });
    }
  },

  // DELETE / POST /contactos/eliminar/:id - Eliminar contacto
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM contactos WHERE id = $1 RETURNING *;', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Contacto no encontrado' });
      }

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ status: 'success', message: 'Contacto eliminado correctamente' });
      }

      res.redirect('/contactos');
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      res.status(500).render('error', { message: 'Error al eliminar contacto', error });
    }
  },

  // GET /contactos/provincias - Listar todas las provincias
  async listarProvincias(req, res) {
    try {
      const result = await pool.query('SELECT * FROM provincias ORDER BY nombre ASC;');
      res.json({ status: 'success', data: result.rows });
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      res.status(500).json({ status: 'error', message: 'Error al obtener provincias' });
    }
  }

};

module.exports = contactosController;
