const { generateRoadmapWithGemini, generateComparativeRoadmap } = require('../services/geminiService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/roadmap/generate
const generateRoadmap = async (req, res) => {
  const { language } = req.body;
  const userId = req.user.userId;

  if (!language) {
    return res.status(400).json({ error: 'Debes especificar un lenguaje de programación' });
  }

  try {
    console.log(`🔄 Generando hoja de ruta para "${language}" (usuario: ${userId})...`);

    // Llamar a Gemini para generar los nodos
    const nodes = await generateRoadmapWithGemini(language);

    // Guardar roadmap en la base de datos
    const roadmap = await prisma.roadmap.create({
      data: { language, nodesData: nodes, userId },
    });

    console.log(`✅ Roadmap "${language}" generado con ${nodes.length} nodos (ID: ${roadmap.id})`);

    res.json({
      roadmapId: roadmap.id,
      language: roadmap.language,
      nodes,
    });
  } catch (error) {
    console.error('❌ Error al generar roadmap:', error.message);
    res.status(500).json({ error: 'Error al generar la hoja de ruta con Gemini' });
  }
};

// GET /api/roadmap/my-roadmaps
const getMyRoadmaps = async (req, res) => {
  const userId = req.user.userId;

  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        language: true,
        createdAt: true,
        nodesData: true,
      },
    });

    // Agregar conteo de nodos a cada roadmap
    const roadmapsWithCount = roadmaps.map((r) => ({
      id: r.id,
      language: r.language,
      createdAt: r.createdAt,
      nodeCount: Array.isArray(r.nodesData) ? r.nodesData.length : 0,
      nodesData: r.nodesData,
    }));

    res.json({ roadmaps: roadmapsWithCount });
  } catch (error) {
    console.error('❌ Error al obtener roadmaps:', error);
    res.status(500).json({ error: 'Error al obtener las hojas de ruta' });
  }
};

// POST /api/roadmap/compare
const compareRoadmaps = async (req, res) => {
  const { langA, langB } = req.body;

  if (!langA || !langB) {
    return res.status(400).json({ error: 'Debes especificar dos lenguajes para comparar (langA y langB)' });
  }

  if (langA.trim().toLowerCase() === langB.trim().toLowerCase()) {
    return res.status(400).json({ error: 'Los dos lenguajes a comparar deben ser diferentes' });
  }

  try {
    console.log(`🔄 Generando comparación: "${langA}" vs "${langB}"...`);
    const result = await generateComparativeRoadmap(langA.trim(), langB.trim());
    console.log(`✅ Comparación "${langA}" vs "${langB}" generada correctamente`);
    res.json(result);
  } catch (error) {
    console.error('❌ Error al generar comparación:', error.message);
    res.status(500).json({ error: 'Error al generar la comparación con la IA' });
  }
};

module.exports = { generateRoadmap, getMyRoadmaps, compareRoadmaps };

