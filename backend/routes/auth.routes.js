// Rutas de autenticación
const express = require('express');
const router = express.Router();
const { login, registro, perfil } = require('../controllers/auth.controller');
const verifyToken   = require('../middleware/verifyToken');
const checkRole     = require('../middleware/checkRole');

router.post('/login',    login);
router.post('/registro', verifyToken, checkRole('admin'), registro); // solo admin crea usuarios
router.get('/perfil',    verifyToken, perfil);
router.get('/usuarios', verifyToken, checkRole('admin'), listarUsuarios);

module.exports = router;