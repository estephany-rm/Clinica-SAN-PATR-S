const db      = require('../config/db');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

const ROUNDS = 10;

// POST /api/auth/login
const login = async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ success: false, data: null, message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, data: null, message: 'Credenciales incorrectas' });
    }

    const user = rows[0];
    const esValido = await bcrypt.compare(password, user.password);

    if (!esValido) {
      return res.status(401).json({ success: false, data: null, message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        usuario: user.usuario,
        rol: user.rol,
        imagen: user.imagen,
        id: user.id
      },
      message: 'Login exitoso'
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// POST /api/auth/registro  (solo admin puede crear usuarios)
const registro = async (req, res) => {
  const { usuario, password, rol, imagen } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ success: false, data: null, message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const hash = await bcrypt.hash(password, ROUNDS);
    const [result] = await db.query(
      'INSERT INTO usuarios (usuario, password, rol, imagen) VALUES (?, ?, ?, ?)',
      [usuario, hash, rol || 'usuario', imagen || null]
    );

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, usuario, rol: rol || 'usuario' },
      message: 'Usuario creado correctamente'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, data: null, message: 'El nombre de usuario ya existe' });
    }
    console.error('Error en registro:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// GET /api/auth/perfil  (usuario autenticado ve su propio perfil)
const perfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, usuario, rol, imagen, creado_en FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ success: true, data: rows[0], message: 'Perfil obtenido' });
  } catch (error) {
    console.error('Error en perfil:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// GET /api/auth/usuarios — solo admin lista todos los usuarios
const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, usuario, rol, imagen, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    return res.status(200).json({ success: true, data: rows, message: 'Usuarios obtenidos' });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// GET /api/auth/usuarios — solo admin lista todos los usuarios
const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, usuario, rol, imagen, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    return res.status(200).json({ success: true, data: rows, message: 'Usuarios obtenidos' });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// Agregar al module.exports:
module.exports = { login, registro, perfil, listarUsuarios };


