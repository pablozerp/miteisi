
const OpenAI = require('openai');
const { enrichRoadmapLinks } = require('./linkService');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Genera una hoja de ruta de aprendizaje para un lenguaje de programación.
 * Utiliza Gemini 2.0 Flash (vía OpenRouter) para generar nodos estructurados en JSON.
 *
 * @param {string} language - Nombre del lenguaje (ej: "Python", "JavaScript")
 * @returns {Array} - Array de nodos con estructura para React Flow
 */
const generateRoadmapWithGemini = async (language) => {
  const prompt = `
Eres un experto en educación en programación. Genera una hoja de ruta de aprendizaje estructurada para el lenguaje de programación: "${language}".

La hoja de ruta debe estar orientada a estudiantes universitarios de Ingeniería en Sistemas en Venezuela (UNERG).

INSTRUCCIONES IMPORTANTES:
- Genera entre 6 y 10 nodos (pasos de aprendizaje).
- Cada nodo debe tener una secuencia lógica (de básico a avanzado).
- Incluye links de YouTube de videos educativos REALES y en español cuando sea posible.
- En el array de "documentation", el campo "url" NO debe ser un enlace HTTP. Debe ser ÚNICAMENTE una frase clave de búsqueda optimizada para Google que sirva para encontrar la mejor documentación oficial o tutorial de ese tema específico en el lenguaje "${language}" (por ejemplo: "Documentación oficial ${language} estructuras de control" o "W3Schools ${language} funciones"). Cada nodo debe tener frases de búsqueda distintas y variadas según su contenido.
- La frase debe estar optimizada, por ejemplo: "Documentación oficial ${language} estructuras de control" o "MDN Web Docs ${language} promesas".
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin bloques de código.

FORMATO EXACTO DEL JSON:
[
  {
    "id": "node-1",
    "title": "Nombre del tema",
    "description": "Descripción breve de lo que aprenderás en este paso",
    "doc_search_term": "Documentación oficial Python funciones",
    "level": "Básico | Intermedio | Avanzado",
    "topics": ["tema1", "tema2", "tema3"],
    "documentation": [
      {
        "title": "Nombre del recurso",
        "url": "https://..."
      }
    ],
    "videos": [
      {
        "title": "Título del video",
        "url": "https://www.youtube.com/watch?v=..."
      }
    ],
    "position": { "x": 0, "y": 0 },
    "dependsOn": []
  },
  {
    "id": "node-2",
    "title": "...",
    "dependsOn": ["node-1"]
  }
]

El campo "dependsOn" indica de qué nodos anteriores depende (para construir las aristas del grafo).
El campo "position" será calculado automáticamente por el frontend, puedes dejarlo en { "x": 0, "y": 0 }.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const text = completion.choices[0].message.content;

    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const extractJsonArray = (input) => {
      const start = input.indexOf('[');
      if (start === -1) return null;

      let depth = 0;
      for (let i = start; i < input.length; i += 1) {
        const char = input[i];
        if (char === '[') depth += 1;
        if (char === ']') depth -= 1;

        if (depth === 0) {
          return input.slice(start, i + 1);
        }
      }

      return null;
    };

    const stripTrailingCommas = (jsonString) => {
      return jsonString
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/\[\s*,/g, '[')
        .replace(/,\s*\]/g, ']');
    };

    let nodes;
    try {
      const jsonText = extractJsonArray(cleanedText);
      if (!jsonText) {
        throw new Error('No se encontró un array JSON en la respuesta');
      }
      nodes = JSON.parse(stripTrailingCommas(jsonText));
    } catch (parseError) {
      console.error('Error parseando JSON de OpenRouter:', parseError.message);
      console.error('Respuesta completa de OpenRouter:', cleanedText);
      throw new Error('La respuesta de la IA no es un JSON válido');
    }

    // Completar enlaces reales si faltan
    nodes = await enrichRoadmapLinks(nodes, language);

    // Calcular posiciones automáticas en el canvas (layout en zigzag vertical)
    const SPACING_X = 350;
    const SPACING_Y = 220;
    nodes.forEach((node, index) => {
      node.position = {
        x: (index % 2) * SPACING_X + 100,
        y: Math.floor(index / 2) * SPACING_Y + 100,
      };
    });

    return nodes;

  } catch (error) {
    console.error("Error conectando con OpenRouter:", error);
    throw new Error('Fallo en la comunicación con la IA');
  }
};

module.exports = { generateRoadmapWithGemini };