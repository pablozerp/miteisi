const express = require('express');
const router = express.Router();
const { generateRoadmap, getMyRoadmaps, compareRoadmaps } = require('../controllers/roadmapController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/roadmap/generate — Generar nueva hoja de ruta (protegida)
router.post('/generate', verifyToken, generateRoadmap);

// GET /api/roadmap/my-roadmaps — Obtener todas las rutas del usuario (protegida)
router.get('/my-roadmaps', verifyToken, getMyRoadmaps);

// POST /api/roadmap/compare — Comparar dos lenguajes (protegida)
router.post('/compare', verifyToken, compareRoadmaps);

module.exports = router;
