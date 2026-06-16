
const OpenAI = require('openai');
const { enrichRoadmapLinks } = require('./linkService');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AcademiCode",
  }
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
- Genera EXACTAMENTE 5 nodos (pasos de aprendizaje) lógicos (de básico a avanzado).
- Incluye links de YouTube de videos educativos REALES y en español cuando sea posible.
- Para "documentation", el campo "url" DEBE ser una URL HTTPS real y directa a la documentación oficial o al mejor recurso disponible (ej: "https://docs.python.org/3/tutorial/controlflow.html"). Si no sabes la URL exacta, pon la URL base de la documentación. NO uses frases de búsqueda.
- Para la lista de "topics" (temas), DEBES usar un arreglo de objetos, cada uno con "name", "description" y "codeExample".
- La "description" DEBE ser EXTREMADAMENTE EXTENSA, didáctica y profunda, explicando abundantemente de qué trata ese tema para que el estudiante aprenda solo.
- ¡CRÍTICO! TODOS LOS TEMAS (topics) DEBEN INCLUIR UN "codeExample" OBLIGATORIAMENTE. No lo dejes vacío. Muestra siempre un bloque de código real.
- ¡CRÍTICO! DEBES incluir SIEMPRE el arreglo "documentation" con al menos 2 enlaces reales. NUNCA lo omitas ni lo dejes vacío.
- Para cada elemento en "documentation" y "videos", DEBES incluir un campo "summary" detallado y conversacional dirigido al estudiante (máximo 150 caracteres).
- Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin bloques de código.
- ¡CRÍTICO! Asegúrate de poner TODAS las comas (,) requeridas entre las propiedades de los objetos (especialmente antes de "codeExample").
- ¡CRÍTICO! NUNCA uses comillas dobles (") dentro de un valor de texto. Usa siempre comillas simples (').
- ¡CRÍTICO! NUNCA uses saltos de línea reales (Enter/Return) dentro de los valores de texto. Usa explícitamente \\n en "codeExample".
- ¡CRÍTICO! Asegúrate de CERRAR todas las comillas. El JSON debe ser 100% estricto y válido.

FORMATO EXACTO DEL JSON:
{
  "roadmap": [
  {
    "id": "node-1",
    "title": "Nombre del tema",
    "description": "Descripción breve de lo que aprenderás en este paso",
    "level": "Básico | Intermedio | Avanzado",
    "topics": [
      {
        "name": "Nombre del tema o concepto (ej. Sintaxis)",
        "description": "Explicación muy detallada y extensa de este tema...",
        "codeExample": "Un bloque de código demostrativo. Usa \\n para saltos de línea."
      }
    ],
    "documentation": [
      {
        "title": "Nombre del recurso",
        "url": "https://ejemplo.com/docs",
        "summary": "Breve descripción de lo que ofrece esta documentación."
      }
    ],
    "videos": [
      {
        "title": "Título del video",
        "url": "https://www.youtube.com/watch?v=ejemplo",
        "summary": "Breve descripción de lo que enseña este video."
      }
    ],
    "position": { "x": 0, "y": 0 },
    "dependsOn": []
  }
  ]
}

El campo "dependsOn" indica de qué nodos anteriores depende.
`;

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const completion = await openai.chat.completions.create({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.3
      });

      const text = completion.choices[0].message?.content || '';
      if (!text || text.includes('User Safety:')) {
        throw new Error('La IA devolvió una respuesta vacía o bloqueada por filtro de seguridad.');
      }

      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const extractJsonObject = (input) => {
        const start = input.indexOf('{');
        const end = input.lastIndexOf('}');
        if (start === -1 || end === -1 || end < start) return null;
        return input.slice(start, end + 1);
      };

      const fixMissingCommas = (jsonString) => {
        let cleaned = jsonString
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/\[\s*,/g, '[')
          .replace(/,\s*\]/g, ']');
        cleaned = cleaned.replace(/"\s*[\n\r]+\s*"/g, '",\n"');
        cleaned = cleaned.replace(/}\s*[\n\r]+\s*{/g, '},\n{');
        return cleaned;
      };

      const jsonText = extractJsonObject(cleanedText);
      if (!jsonText) {
        throw new Error('No se encontró un objeto JSON en la respuesta');
      }
      
      let parsedData = JSON.parse(fixMissingCommas(jsonText));
      let nodes = parsedData.roadmap || [];

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
      attempt++;
      console.error(`Intento ${attempt} fallido para generar Roadmap de ${language}:`, error.message);
      if (attempt >= maxAttempts) {
        throw new Error('Fallo en la comunicación con la IA tras varios intentos');
      }
      // Pequeña pausa antes de reintentar para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
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
¡CRÍTICO! Asegúrate de poner TODAS las comas (,) requeridas entre las propiedades de los objetos.
¡CRÍTICO! NUNCA uses comillas dobles (") dentro de los valores de texto. Si necesitas entrecomillar, usa SIEMPRE comillas simples (').
¡CRÍTICO! En los campos "codeA" y "codeB", NUNCA uses saltos de línea reales (Enter/Return). Usa SIEMPRE la secuencia de escape \\n para representar saltos de línea dentro del código.
¡CRÍTICO! Asegúrate de CERRAR todas las comillas dobles al final de cada valor. El JSON debe ser 100% estricto y válido.

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
  "codeExamples": [
    {
      "concept": "Nombre del concepto comparado (ej: Promesas / Async-Await)",
      "description": "Breve descripción de qué hace este ejemplo y qué diferencias clave ilustra entre ambos lenguajes.",
      "codeA": "// Código en ${langA}\\nlinea1\\nlinea2\\nlinea3",
      "codeB": "// Código en ${langB}\\nlinea1\\nlinea2\\nlinea3"
    }
  ]
}

Genera EXACTAMENTE 3 ejemplos de código en "codeExamples". Cada ejemplo debe comparar un concepto importante (variables, funciones, clases, etc). Los ejemplos deben ser cortos, al grano y mostrar claramente las diferencias de sintaxis.
`;

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const completion = await openai.chat.completions.create({
        model: "openrouter/free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.3
      });

      const text = completion.choices[0].message?.content || '';
      if (!text || text.includes('User Safety:')) {
        throw new Error('La IA devolvió una respuesta vacía o bloqueada por filtro de seguridad.');
      }

      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      // Extraer el objeto JSON raíz
      const extractJsonObject = (input) => {
        const start = input.indexOf('{');
        const end = input.lastIndexOf('}');
        if (start === -1 || end === -1 || end < start) return null;
        return input.slice(start, end + 1);
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

      const jsonText = extractJsonObject(cleanedText);
      if (!jsonText) throw new Error('No se encontró un objeto JSON en la respuesta comparativa');
      let result = JSON.parse(fixMissingCommas(jsonText));

      // Asegurarse de que codeExamples sea un array
      if (!Array.isArray(result.codeExamples)) {
        result.codeExamples = [];
      }

      return result;
    } catch (error) {
      attempt++;
      console.error(`Intento ${attempt} fallido para generar Comparación ${langA} vs ${langB}:`, error.message);
      if (attempt >= maxAttempts) {
        throw new Error('Fallo al generar la comparación con la IA tras varios intentos');
      }
      // Pequeña pausa antes de reintentar para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

module.exports = { generateRoadmapWithGemini, generateComparativeRoadmap };
