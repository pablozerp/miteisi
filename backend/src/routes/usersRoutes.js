const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();

/**
 * GET /api/users
 * Retorna la lista de todos los usuarios activos (excepto el usuario actual).
 * Accesible por cualquier usuario autenticado (no solo admins).
 * Campos expuestos: solo los necesarios para la UI de chat — sin passwords ni datos sensibles.
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        NOT: { id: currentUserId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
      ],
    });

    res.json({ users });
  } catch (error) {
    console.error('Error obteniendo lista de usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

module.exports = router;
