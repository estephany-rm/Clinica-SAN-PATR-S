// CRUD de Pacientes
const db = require('../config/db');

// GET /api/pacientes — listar todos (con búsqueda opcional)
const listar = async (req, res) => {
  try {
    const { buscar } = req.query;
    let sql    = 'SELECT * FROM paciente ORDER BY apellidos, nombre';
    let params = [];

    if (buscar) {
      sql    = 'SELECT * FROM paciente WHERE nombre LIKE ? OR apellidos LIKE ? OR telefono LIKE ? ORDER BY apellidos, nombre';
      params = [`%${buscar}%`, `%${buscar}%`, `%${buscar}%`];
    }

    const [rows] = await db.query(sql, params);
    return res.status(200).json({ success: true, data: rows, message: 'Pacientes obtenidos correctamente' });
  } catch (error) {
    console.error('Error al listar pacientes:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// GET /api/pacientes/:id — obtener un paciente por ID
const obtener = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM paciente WHERE codigo = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Paciente no encontrado' });
    }
    return res.status(200).json({ success: true, data: rows[0], message: 'Paciente obtenido' });
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// POST /api/pacientes — crear nuevo paciente
const crear = async (req, res) => {
  const { nombre, apellidos, direccion, poblacion, provincia, codigo_postal, telefono, fecha_nacimiento } = req.body;

  if (!nombre || !apellidos || !fecha_nacimiento) {
    return res.status(400).json({ success: false, data: null, message: 'Nombre, apellidos y fecha de nacimiento son requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO paciente (nombre, apellidos, direccion, poblacion, provincia, codigo_postal, telefono, fecha_nacimiento) VALUES (?,?,?,?,?,?,?,?)',
      [nombre, apellidos, direccion || null, poblacion || null, provincia || null, codigo_postal || null, telefono || null, fecha_nacimiento]
    );
    return res.status(201).json({ success: true, data: { codigo: result.insertId }, message: 'Paciente creado correctamente' });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// PUT /api/pacientes/:id — actualizar paciente
const actualizar = async (req, res) => {
  const { nombre, apellidos, direccion, poblacion, provincia, codigo_postal, telefono, fecha_nacimiento } = req.body;

  if (!nombre || !apellidos || !fecha_nacimiento) {
    return res.status(400).json({ success: false, data: null, message: 'Nombre, apellidos y fecha de nacimiento son requeridos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE paciente SET nombre=?, apellidos=?, direccion=?, poblacion=?, provincia=?, codigo_postal=?, telefono=?, fecha_nacimiento=? WHERE codigo=?',
      [nombre, apellidos, direccion || null, poblacion || null, provincia || null, codigo_postal || null, telefono || null, fecha_nacimiento, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Paciente no encontrado' });
    }
    return res.status(200).json({ success: true, data: null, message: 'Paciente actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// DELETE /api/pacientes/:id — eliminar paciente
const eliminar = async (req, res) => {
  try {
    // Verificar si tiene ingresos asociados (FK RESTRICT)
    const [ingresos] = await db.query('SELECT COUNT(*) as total FROM ingreso WHERE paciente_codigo = ?', [req.params.id]);
    if (ingresos[0].total > 0) {
      return res.status(409).json({ success: false, data: null, message: 'No se puede eliminar: el paciente tiene ingresos registrados' });
    }

    const [result] = await db.query('DELETE FROM paciente WHERE codigo = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Paciente no encontrado' });
    }
    return res.status(200).json({ success: true, data: null, message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };