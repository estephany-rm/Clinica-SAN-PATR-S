// Rutas de Pacientes
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paciente.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/',      verifyToken, ctrl.listar);
router.get('/:id',  verifyToken, ctrl.obtener);
router.post('/',    verifyToken, ctrl.crear);                          
router.put('/:id',  verifyToken, ctrl.actualizar);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.eliminar); // solo admin puede eliminar

module.exports = router;