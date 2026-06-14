/**
 * Sandbox Service — AcademiCode
 * Ejecuta código de usuario de forma segura usando Judge0 API.
 * 
 * Judge0 es un motor de ejecución de código open-source.
 * Se cambió Piston a Judge0 porque la API pública de Piston ahora requiere whitelist.
 * API pública: https://ce.judge0.com
 * 
 * Medidas de seguridad:
 * - Ejecución en contenedores aislados (manejado por Judge0)
 * - Timeout máximo
 * - Sin acceso a red desde el código ejecutado
 * - Validación de código y lenguaje antes de ejecutar
 */

const https = require('https');
const http = require('http');

// URL de la API de Judge0
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';

/**
 * Configuración de lenguajes soportados.
 * Cada lenguaje mapea al language_id de Judge0.
 */
const LANGUAGE_CONFIG = {
  javascript: { id: 93,  language: 'javascript', version: '18.15.0', aliases: ['js', 'node'] },
  python:     { id: 92,  language: 'python',     version: '3.11.2',  aliases: ['py', 'python3'] },
  java:       { id: 91,  language: 'java',       version: '17.0.6',  aliases: [] },
  cpp:        { id: 105, language: 'c++',        version: '14.1.0',  aliases: ['cpp', 'c++'] },
  c:          { id: 103, language: 'c',          version: '14.1.0',  aliases: [] },
  go:         { id: 107, language: 'go',         version: '1.23.5',  aliases: ['golang'] },
  typescript: { id: 101, language: 'typescript', version: '5.6.2',   aliases: ['ts'] },
  rust:       { id: 108, language: 'rust',       version: '1.85.0',  aliases: ['rs'] },
  php:        { id: 98,  language: 'php',        version: '8.3.11',  aliases: [] },
  ruby:       { id: 72,  language: 'ruby',       version: '2.7.0',   aliases: ['rb'] },
};

/**
 * Extensiones de archivo por lenguaje (informativo, Judge0 no lo requiere pero mantenemos compatibilidad de la interfaz)
 */
const FILE_EXTENSIONS = {
  javascript: 'js',
  python:     'py',
  java:       'java',
  cpp:        'cpp',
  c:          'c',
  go:         'go',
  typescript: 'ts',
  rust:       'rs',
  php:        'php',
  ruby:       'rb',
};

/**
 * Valida el código antes de ejecutarlo.
 */
const validateCode = (code, language) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'El código no puede estar vacío.' };
  }

  if (code.length > 50000) {
    return { valid: false, error: 'El código no puede exceder 50,000 caracteres.' };
  }

  const normalizedLang = language?.toLowerCase().trim();
  if (!normalizedLang || !LANGUAGE_CONFIG[normalizedLang]) {
    return { 
      valid: false, 
      error: `Lenguaje "${language}" no soportado. Soportados: ${Object.keys(LANGUAGE_CONFIG).join(', ')}` 
    };
  }

  return { valid: true };
};

/**
 * Normaliza el nombre del lenguaje, manejando aliases.
 */
const normalizeLanguage = (language) => {
  const lang = language?.toLowerCase().trim();
  
  if (LANGUAGE_CONFIG[lang]) return lang;
  
  for (const [key, config] of Object.entries(LANGUAGE_CONFIG)) {
    if (config.aliases.includes(lang)) return key;
  }
  
  return null;
};

/**
 * Hace una petición HTTP/HTTPS.
 */
const makeRequest = (url, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 20000, // 20s timeout
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400 && res.statusCode !== 422) {
             // Judge0 sometimes returns 422 if Unprocessable Entity
             reject(new Error(parsed.error || parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Error parseando respuesta: ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout: la petición a Judge0 tardó demasiado.'));
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Ejecuta código en el sandbox usando Judge0.
 */
const executeInSandbox = async (code, language, stdin = '') => {
  const startTime = Date.now();

  const normalizedLang = normalizeLanguage(language);
  if (!normalizedLang) {
    return {
      success: false,
      output: '',
      error: `Lenguaje "${language}" no soportado.`,
      executionTime: 0,
      language: language,
    };
  }

  const validation = validateCode(code, normalizedLang);
  if (!validation.valid) {
    return {
      success: false,
      output: '',
      error: validation.error,
      executionTime: 0,
      language: normalizedLang,
    };
  }

  const config = LANGUAGE_CONFIG[normalizedLang];

  try {
    // Para Judge0 pedimos que sea síncrono si es posible usando base64_encoded=false&wait=true
    const requestBody = {
      language_id: config.id,
      source_code: Buffer.from(code).toString('base64'),
      stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
    };

    const result = await makeRequest(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, requestBody);

    // Judge0 execution time calculation
    const executionTime = result.time ? Math.round(parseFloat(result.time) * 1000) : Date.now() - startTime;

    // Procesar respuesta de Judge0
    const decodeBase64 = (str) => str ? Buffer.from(str, 'base64').toString('utf-8') : '';

    const statusId = result.status?.id;
    const stdout = decodeBase64(result.stdout);
    const stderr = decodeBase64(result.stderr);
    const compileOutput = decodeBase64(result.compile_output);
    const message = decodeBase64(result.message);

    // Si hubo error de compilación (status 6)
    if (statusId === 6) {
      return {
        success: false,
        output: '',
        error: compileOutput || 'Error de compilación',
        executionTime,
        language: normalizedLang,
      };
    }

    // Si hubo otros errores de runtime (Time limit, runtime error, etc: 4, 5, 7-14)
    if (statusId > 3) {
      return {
        success: false,
        output: stdout,
        error: stderr || message || result.status?.description || 'Error en la ejecución',
        executionTime,
        language: normalizedLang,
      };
    }

    // Ejecución exitosa (status 3 = Accepted)
    return {
      success: true,
      output: stdout || '(sin output)',
      error: '',
      executionTime,
      language: normalizedLang,
    };

  } catch (err) {
    const executionTime = Date.now() - startTime;
    console.error('Error en sandbox execution (Judge0):', err.message);

    return {
      success: false,
      output: '',
      error: err.message || 'Error desconocido al ejecutar el código. Intente de nuevo más tarde.',
      executionTime,
      language: normalizedLang,
    };
  }
};

/**
 * Obtiene la lista de lenguajes soportados.
 */
const getSupportedLanguages = () => {
  return Object.entries(LANGUAGE_CONFIG).map(([id, config]) => ({
    id,
    name: config.language,
    version: config.version,
    aliases: config.aliases,
    extension: FILE_EXTENSIONS[id],
  }));
};

module.exports = {
  executeInSandbox,
  validateCode,
  normalizeLanguage,
  getSupportedLanguages,
  LANGUAGE_CONFIG,
};
