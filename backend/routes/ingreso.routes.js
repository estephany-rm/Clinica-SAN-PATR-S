// Rutas de Ingresos
const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/ingreso.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole   = require('../middleware/checkRole');

router.get('/estadisticas', verifyToken, ctrl.estadisticas);
router.get('/',       verifyToken, ctrl.listar);
router.get('/:id',   verifyToken, ctrl.obtener);
router.post('/',     verifyToken, ctrl.crear);
router.put('/:id',   verifyToken, ctrl.actualizar);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.eliminar);

module.exports = router;