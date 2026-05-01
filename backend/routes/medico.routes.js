// Rutas de Médicos
const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/medico.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole   = require('../middleware/checkRole');

router.get('/',       verifyToken, ctrl.listar);
router.get('/:id',   verifyToken, ctrl.obtener);
router.post('/',     verifyToken, checkRole('admin', 'moderador'), ctrl.crear);
router.put('/:id',   verifyToken, checkRole('admin', 'moderador'), ctrl.actualizar);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.eliminar);

module.exports = router;