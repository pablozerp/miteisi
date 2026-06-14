/**
 * Code Controller — AcademiCode
 * Maneja las peticiones de ejecución de código y consulta de lenguajes soportados.
 */

const { executeInSandbox, getSupportedLanguages } = require('../services/sandboxService');

/**
 * POST /api/code/execute
 * Ejecuta código en el sandbox seguro.
 * 
 * Body: { code: string, language: string, stdin?: string }
 * Response: { success, output, error, executionTime, language }
 */
const executeCode = async (req, res) => {
  const { code, language, stdin } = req.body;

  // Validaciones básicas
  if (!code || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ 
      success: false,
      error: 'El campo "code" es obligatorio y no puede estar vacío.' 
    });
  }

  if (!language || typeof language !== 'string') {
    return res.status(400).json({ 
      success: false,
      error: 'El campo "language" es obligatorio.' 
    });
  }

  try {
    console.log(`⚡ Ejecutando código [${language}] para usuario ${req.user.userId} (${code.length} chars)`);
    
    const result = await executeInSandbox(code, language, stdin || '');
    
    console.log(`✅ Ejecución completada [${language}] en ${result.executionTime}ms — ${result.success ? 'OK' : 'ERROR'}`);

    res.json(result);
  } catch (error) {
    console.error('Error en executeCode:', error);
    res.status(500).json({
      success: false,
      output: '',
      error: 'Error interno al ejecutar el código. Intenta de nuevo.',
      executionTime: 0,
      language: language,
    });
  }
};

/**
 * GET /api/code/languages
 * Retorna la lista de lenguajes soportados por el sandbox.
 * 
 * Response: { languages: [{ id, name, version, aliases, extension }] }
 */
const getLanguages = (req, res) => {
  const languages = getSupportedLanguages();
  res.json({ languages });
};

module.exports = { executeCode, getLanguages };
