const express = require('express');
const { getStats, getUsers, toggleUserStatus, assignRole, createUser, updateUser, deleteUser, getWeeklyStats } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas aquí requieren autenticación y rol de ADMIN o SUPERADMIN
router.use(verifyToken);

// Rutas accesibles por ADMIN y SUPERADMIN
router.get('/stats', requireRole(['ADMIN', 'SUPERADMIN']), getStats);
router.get('/users', requireRole(['ADMIN', 'SUPERADMIN']), getUsers);
router.post('/users/:id/toggle-status', requireRole(['ADMIN', 'SUPERADMIN']), toggleUserStatus);

router.get('/weekly-stats', requireRole(['ADMIN', 'SUPERADMIN']), getWeeklyStats);
router.post('/users', requireRole(['ADMIN', 'SUPERADMIN']), createUser);
router.put('/users/:id', requireRole(['ADMIN', 'SUPERADMIN']), updateUser);
router.delete('/users/:id', requireRole(['ADMIN', 'SUPERADMIN']), deleteUser);

// Rutas exclusivas de SUPERADMIN
router.post('/users/:id/assign-role', requireRole(['SUPERADMIN']), assignRole);

module.exports = router;
