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
    const currentUserRole = req.user.role;

    const whereClause = {
      isActive: true,
      NOT: { id: currentUserId },
    };

    // Si el usuario es un estudiante (USER), no debería ver al SUPERADMIN en el chat.
    if (currentUserRole === 'USER') {
      whereClause.role = { not: 'SUPERADMIN' };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
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
