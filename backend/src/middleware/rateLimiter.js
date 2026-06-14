/**
 * Rate Limiter Middleware — AcademiCode
 * Limita las ejecuciones de código por usuario para proteger el sandbox.
 * Máximo 10 ejecuciones por minuto por usuario.
 */

const rateLimitStore = new Map();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10;

/**
 * Limpia entradas expiradas periódicamente para evitar memory leaks.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cada 5 minutos

const codeRateLimiter = (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  const key = `code_exec_${userId}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Nueva ventana
    entry = { windowStart: now, count: 1 };
    rateLimitStore.set(key, entry);
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return res.status(429).json({
      error: `Has excedido el límite de ${MAX_REQUESTS} ejecuciones por minuto.`,
      retryAfter,
      message: `Intenta de nuevo en ${retryAfter} segundos.`
    });
  }

  entry.count++;
  return next();
};

module.exports = { codeRateLimiter };
