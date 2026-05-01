// CRUD de Médicos
const db = require('../config/db');

const listar = async (req, res) => {
  try {
    const { buscar } = req.query;
    let sql = 'SELECT * FROM medico ORDER BY apellidos, nombre';
    let params = [];

    if (buscar) {
      sql = 'SELECT * FROM medico WHERE nombre LIKE ? OR apellidos LIKE ? OR especialidad LIKE ? ORDER BY apellidos, nombre';
      params = [`%${buscar}%`, `%${buscar}%`, `%${buscar}%`];
    }

    const [rows] = await db.query(sql, params);
    return res.status(200).json({ success: true, data: rows, message: 'Médicos obtenidos correctamente' });
  } catch (error) {
    console.error('Error al listar médicos:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const obtener = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM medico WHERE codigo = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Médico no encontrado' });
    }
    return res.status(200).json({ success: true, data: rows[0], message: 'Médico obtenido' });
  } catch (error) {
    console.error('Error al obtener médico:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const crear = async (req, res) => {
  const { nombre, apellidos, telefono, especialidad } = req.body;

  if (!nombre || !apellidos || !especialidad) {
    return res.status(400).json({ success: false, data: null, message: 'Nombre, apellidos y especialidad son requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO medico (nombre, apellidos, telefono, especialidad) VALUES (?,?,?,?)',
      [nombre, apellidos, telefono || null, especialidad]
    );
    return res.status(201).json({ success: true, data: { codigo: result.insertId }, message: 'Médico creado correctamente' });
  } catch (error) {
    console.error('Error al crear médico:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const actualizar = async (req, res) => {
  const { nombre, apellidos, telefono, especialidad } = req.body;

  if (!nombre || !apellidos || !especialidad) {
    return res.status(400).json({ success: false, data: null, message: 'Nombre, apellidos y especialidad son requeridos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE medico SET nombre=?, apellidos=?, telefono=?, especialidad=? WHERE codigo=?',
      [nombre, apellidos, telefono || null, especialidad, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Médico no encontrado' });
    }
    return res.status(200).json({ success: true, data: null, message: 'Médico actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar médico:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const eliminar = async (req, res) => {
  try {
    const [ingresos] = await db.query('SELECT COUNT(*) as total FROM ingreso WHERE medico_codigo = ?', [req.params.id]);
    if (ingresos[0].total > 0) {
      return res.status(409).json({ success: false, data: null, message: 'No se puede eliminar: el médico tiene ingresos registrados' });
    }

    const [result] = await db.query('DELETE FROM medico WHERE codigo = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Médico no encontrado' });
    }
    return res.status(200).json({ success: true, data: null, message: 'Médico eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar médico:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };