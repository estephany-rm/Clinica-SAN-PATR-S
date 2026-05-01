// CRUD de Ingresos
const db = require('../config/db');

// GET /api/ingresos — listar todos con info de paciente y médico
const listar = async (req, res) => {
  try {
    const sql = `
      SELECT 
        i.codigo,
        i.num_habitacion,
        i.cama,
        i.fecha_ingreso,
        i.paciente_codigo,
        i.medico_codigo,
        CONCAT(p.nombre, ' ', p.apellidos) AS nombre_paciente,
        CONCAT(m.nombre, ' ', m.apellidos) AS nombre_medico,
        m.especialidad
      FROM ingreso i
      JOIN paciente p ON i.paciente_codigo = p.codigo
      JOIN medico   m ON i.medico_codigo   = m.codigo
      ORDER BY i.fecha_ingreso DESC
    `;
    const [rows] = await db.query(sql);
    return res.status(200).json({ success: true, data: rows, message: 'Ingresos obtenidos correctamente' });
  } catch (error) {
    console.error('Error al listar ingresos:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const obtener = async (req, res) => {
  try {
    const sql = `
      SELECT i.*, 
        CONCAT(p.nombre, ' ', p.apellidos) AS nombre_paciente,
        CONCAT(m.nombre, ' ', m.apellidos) AS nombre_medico
      FROM ingreso i
      JOIN paciente p ON i.paciente_codigo = p.codigo
      JOIN medico   m ON i.medico_codigo   = m.codigo
      WHERE i.codigo = ?
    `;
    const [rows] = await db.query(sql, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Ingreso no encontrado' });
    }
    return res.status(200).json({ success: true, data: rows[0], message: 'Ingreso obtenido' });
  } catch (error) {
    console.error('Error al obtener ingreso:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const crear = async (req, res) => {
  const { num_habitacion, cama, fecha_ingreso, paciente_codigo, medico_codigo } = req.body;

  if (!num_habitacion || !cama || !paciente_codigo || !medico_codigo) {
    return res.status(400).json({ success: false, data: null, message: 'Habitación, cama, paciente y médico son requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO ingreso (num_habitacion, cama, fecha_ingreso, paciente_codigo, medico_codigo) VALUES (?,?,?,?,?)',
      [num_habitacion, cama, fecha_ingreso || new Date(), paciente_codigo, medico_codigo]
    );
    return res.status(201).json({ success: true, data: { codigo: result.insertId }, message: 'Ingreso creado correctamente' });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ success: false, data: null, message: 'Paciente o médico no existe' });
    }
    console.error('Error al crear ingreso:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const actualizar = async (req, res) => {
  const { num_habitacion, cama, fecha_ingreso, paciente_codigo, medico_codigo } = req.body;

  if (!num_habitacion || !cama || !paciente_codigo || !medico_codigo) {
    return res.status(400).json({ success: false, data: null, message: 'Todos los campos son requeridos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE ingreso SET num_habitacion=?, cama=?, fecha_ingreso=?, paciente_codigo=?, medico_codigo=? WHERE codigo=?',
      [num_habitacion, cama, fecha_ingreso, paciente_codigo, medico_codigo, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Ingreso no encontrado' });
    }
    return res.status(200).json({ success: true, data: null, message: 'Ingreso actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar ingreso:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const eliminar = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM ingreso WHERE codigo = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Ingreso no encontrado' });
    }
    return res.status(200).json({ success: true, data: null, message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// GET /api/ingresos/estadisticas — datos para las cards del dashboard
const estadisticas = async (req, res) => {
  try {
    const [[{ total_pacientes }]] = await db.query('SELECT COUNT(*) as total_pacientes FROM paciente');
    const [[{ total_medicos }]]   = await db.query('SELECT COUNT(*) as total_medicos FROM medico');
    const [[{ total_ingresos }]]  = await db.query('SELECT COUNT(*) as total_ingresos FROM ingreso');

    return res.status(200).json({
      success: true,
      data: { total_pacientes, total_medicos, total_ingresos },
      message: 'Estadísticas obtenidas'
    });
  } catch (error) {
    console.error('Error en estadísticas:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, estadisticas };