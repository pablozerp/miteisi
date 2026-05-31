const express = require('express');
const router = express.Router();
const { generateRoadmap, getMyRoadmaps } = require('../controllers/roadmapController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/roadmap/generate — Generar nueva hoja de ruta (protegida)
router.post('/generate', verifyToken, generateRoadmap);

// GET /api/roadmap/my-roadmaps — Obtener todas las rutas del usuario (protegida)
router.get('/my-roadmaps', verifyToken, getMyRoadmaps);

module.exports = router;
