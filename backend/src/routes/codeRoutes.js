/**
 * Code Routes — AcademiCode
 * Rutas para ejecución de código y consulta de lenguajes.
 */

const express = require('express');
const router = express.Router();
const { executeCode, getLanguages } = require('../controllers/codeController');
const { verifyToken } = require('../middleware/authMiddleware');
const { codeRateLimiter } = require('../middleware/rateLimiter');

// POST /api/code/execute — Ejecutar código en sandbox (requiere auth + rate limit)
router.post('/execute', verifyToken, codeRateLimiter, executeCode);

// GET /api/code/languages — Obtener lenguajes soportados (requiere auth)
router.get('/languages', verifyToken, getLanguages);

module.exports = router;
