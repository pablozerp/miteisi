
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
Eres un experto en educación en programación. Genera una hoja de ruta de aprendizaje estructurada para el lenguaje/tecnología: "${language}".

La hoja de ruta debe estar orientada a estudiantes universitarios de Ingeniería en Sistemas en Venezuela (UNERG).

INSTRUCCIONES IMPORTANTES:
- Genera entre 6 y 9 nodos (pasos de aprendizaje) lógicos (de básico a avanzado).
- Incluye links de YouTube de videos educativos REALES y en español cuando sea posible.
- Para "documentation", el campo "url" DEBE ser una URL HTTPS real y directa a la documentación oficial o al mejor recurso disponible (ej: "https://docs.python.org/3/tutorial/controlflow.html"). Si no sabes la URL exacta, pon la URL base de la documentación. NO uses frases de búsqueda.
- Para la lista de "topics" (temas), NO uses un arreglo de strings simples. DEBES usar un arreglo de objetos, cada uno con "name" (nombre del tema) y "description". La "description" debe ser extensa y muy didáctica, explicando bien de qué trata ese tema para que la ruta sea robusta y el estudiante pueda comprenderlo por sí solo sin depender únicamente de enlaces.
- Para cada elemento en "documentation" y "videos", DEBES incluir un campo "summary" detallado y conversacional dirigido al estudiante (máximo 150 caracteres). Ejemplo: "Aquí aprenderás leyendo la documentación oficial donde encontrarás conceptos clave como qué es un API y cómo funcionan los microservicios."
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin bloques de código.
- ¡CRÍTICO! Asegúrate de poner TODAS las comas (,) requeridas entre las propiedades de los objetos (especialmente antes de "codeExample"). El JSON debe ser 100% estricto y válido.

FORMATO EXACTO DEL JSON:
[
  {
    "id": "node-1",
    "title": "Nombre del tema",
    "description": "Descripción breve de lo que aprenderás en este paso",
    "level": "Básico | Intermedio | Avanzado",
    "topics": [
      {
        "name": "Nombre del tema o concepto (ej. Sintaxis)",
        "description": "Explicación detallada de este tema, qué es, para qué sirve y cómo se aplica...",
        "codeExample": "Opcional. Una línea de código o bloque corto como ejemplo (como string puro). Si no aplica, dejar vacío o null."
      }
    ],
    "documentation": [
      {
        "title": "Nombre del recurso",
        "url": "https://...",
        "summary": "Breve descripción de lo que ofrece esta documentación."
      }
    ],
    "videos": [
      {
        "title": "Título del video",
        "url": "https://www.youtube.com/watch?v=...",
        "summary": "Breve descripción de lo que enseña este video."
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

El campo "dependsOn" indica de qué nodos anteriores depende.
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

    const fixMissingCommas = (jsonString) => {
      let cleaned = jsonString
        .replace(/,\s*([}\]])/g, '$1') // Remueve trailing commas
        .replace(/\[\s*,/g, '[')
        .replace(/,\s*\]/g, ']');
      
      // Repara comas faltantes entre valores string (ej. "valor" \n "clave")
      cleaned = cleaned.replace(/"\s*[\n\r]+\s*"/g, '",\n"');
      // Repara comas faltantes entre objetos (ej. } \n { )
      cleaned = cleaned.replace(/}\s*[\n\r]+\s*{/g, '},\n{');
      // Repara comas faltantes entre string y llaves (ej. "valor" \n } ) aunque no debería causar error, por si acaso, no, eso no lleva coma.
      return cleaned;
    };

    let nodes;
    try {
      const jsonText = extractJsonArray(cleanedText);
      if (!jsonText) {
        throw new Error('No se encontró un array JSON en la respuesta');
      }
      nodes = JSON.parse(fixMissingCommas(jsonText));
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


/**
 * Genera una hoja de ruta COMPARATIVA entre dos lenguajes/tecnologías.
 * Analiza similitudes, diferencias y cuándo elegir uno sobre el otro.
 *
 * @param {string} langA - Primer lenguaje (ej: "Python")
 * @param {string} langB - Segundo lenguaje (ej: "JavaScript")
 * @returns {Object} - Objeto con nodesA, nodesB y comparison
 */
const generateComparativeRoadmap = async (langA, langB) => {
  const prompt = `
Eres un experto en educación en programación. Genera un análisis comparativo detallado entre "${langA}" y "${langB}" para estudiantes universitarios de Ingeniería en Sistemas (UNERG, Venezuela).

Responde ÚNICAMENTE con un JSON válido sin texto adicional, sin bloques de código markdown.
¡CRÍTICO! Asegúrate de poner TODAS las comas (,) requeridas entre las propiedades de los objetos (especialmente antes de "codeExample"). El JSON debe ser 100% estricto y válido.

El JSON debe tener exactamente esta estructura:
{
  "langA": "${langA}",
  "langB": "${langB}",
  "comparison": {
    "summary": "Resumen de 2-3 oraciones comparando ambos lenguajes de forma objetiva.",
    "useCases": {
      "${langA}": ["caso de uso 1", "caso de uso 2", "caso de uso 3"],
      "${langB}": ["caso de uso 1", "caso de uso 2", "caso de uso 3"]
    },
    "strengths": {
      "${langA}": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
      "${langB}": ["fortaleza 1", "fortaleza 2", "fortaleza 3"]
    },
    "weaknesses": {
      "${langA}": ["debilidad 1", "debilidad 2"],
      "${langB}": ["debilidad 1", "debilidad 2"]
    },
    "salaryTrend": {
      "${langA}": "Tendencia salarial y demanda laboral en Latinoamérica",
      "${langB}": "Tendencia salarial y demanda laboral en Latinoamérica"
    },
    "difficulty": {
      "${langA}": "Fácil | Moderado | Difícil",
      "${langB}": "Fácil | Moderado | Difícil"
    },
    "verdict": "Recomendación final: cuándo elegir uno u otro, con cuál empezar y por qué."
  },
  "nodesA": [
    {
      "id": "a-node-1",
      "title": "Nombre del tema en ${langA}",
      "description": "Descripción breve",
      "level": "Básico | Intermedio | Avanzado",
      "topics": [
        {
          "name": "tema1",
          "description": "Explicación detallada del concepto",
          "codeExample": "Opcional. Ejemplo de código en formato string."
        }
      ],
      "position": { "x": 0, "y": 0 },
      "dependsOn": []
    }
  ],
  "nodesB": [
    {
      "id": "b-node-1",
      "title": "Nombre del tema en ${langB}",
      "description": "Descripción breve",
      "level": "Básico | Intermedio | Avanzado",
      "topics": [
        {
          "name": "tema1",
          "description": "Explicación detallada del concepto",
          "codeExample": "Opcional. Ejemplo de código en formato string."
        }
      ],
      "position": { "x": 0, "y": 0 },
      "dependsOn": []
    }
  ]
}

Genera entre 5 y 7 nodos para nodesA y 5 a 7 nodos para nodesB.
Los ids de nodesA deben comenzar con "a-" y los de nodesB con "b-".
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }]
    });

    const text = completion.choices[0].message.content;
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Extraer el objeto JSON raíz
    const extractJsonObject = (input) => {
      const start = input.indexOf('{');
      if (start === -1) return null;
      let depth = 0;
      for (let i = start; i < input.length; i++) {
        if (input[i] === '{') depth++;
        if (input[i] === '}') depth--;
        if (depth === 0) return input.slice(start, i + 1);
      }
      return null;
    };

    const fixMissingCommas = (s) => {
      let cleaned = s
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/\[\s*,/g, '[')
        .replace(/,\s*\]/g, ']');
      cleaned = cleaned.replace(/"\s*[\n\r]+\s*"/g, '",\n"');
      cleaned = cleaned.replace(/}\s*[\n\r]+\s*{/g, '},\n{');
      return cleaned;
    };

    let result;
    try {
      const jsonText = extractJsonObject(cleanedText);
      if (!jsonText) throw new Error('No se encontró un objeto JSON en la respuesta comparativa');
      result = JSON.parse(fixMissingCommas(jsonText));
    } catch (parseError) {
      console.error('Error parseando JSON comparativo:', parseError.message);
      throw new Error('La respuesta de la IA para la comparación no es un JSON válido');
    }

    // Calcular posiciones automáticas para cada set de nodos
    const SPACING_X = 350;
    const SPACING_Y = 220;
    if (result.nodesA) {
      result.nodesA.forEach((node, index) => {
        node.position = {
          x: (index % 2) * SPACING_X + 100,
          y: Math.floor(index / 2) * SPACING_Y + 100,
        };
      });
    }
    if (result.nodesB) {
      result.nodesB.forEach((node, index) => {
        node.position = {
          x: (index % 2) * SPACING_X + 100,
          y: Math.floor(index / 2) * SPACING_Y + 100,
        };
      });
    }

    return result;
  } catch (error) {
    console.error('Error en generateComparativeRoadmap:', error);
    throw new Error('Fallo al generar la comparación con la IA');
  }
};

module.exports = { generateRoadmapWithGemini, generateComparativeRoadmap };