const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRoadmaps = await prisma.roadmap.count();
    
    // Contar roadmaps por lenguaje
    const roadmapsByLanguage = await prisma.roadmap.groupBy({
      by: ['language'],
      _count: { language: true },
      orderBy: { _count: { language: 'desc' } },
      take: 5
    });

    res.json({
      totalUsers,
      totalRoadmaps,
      topLanguages: roadmapsByLanguage.map(r => ({ language: r.language, count: r._count.language }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'SUPERADMIN';
    
    // Si es ADMIN normal, no mostrar a otros admins o superadmins en la tabla
    // Si es SUPERADMIN, mostrar a todos
    const whereClause = isSuperAdmin ? {} : { role: 'USER' };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        cedula: true,
        semester: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { roadmaps: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
};

// POST /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // No se puede bloquear a un SUPERADMIN
    if (user.role === 'SUPERADMIN') {
      return res.status(403).json({ error: 'No se puede bloquear a un Súper Administrador' });
    }
    
    // Un ADMIN normal no puede bloquear a otro ADMIN
    if (user.role === 'ADMIN' && req.user.role === 'ADMIN') {
      return res.status(403).json({ error: 'No tienes permisos para bloquear a este administrador' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive: !user.isActive }
    });

    res.json({ message: 'Estado actualizado', isActive: updatedUser.isActive });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del usuario' });
  }
};

// POST /api/admin/users/:id/assign-role
const assignRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'USER', 'ADMIN' o 'SUPERADMIN'

  try {
    if (!['USER', 'ADMIN', 'SUPERADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role }
    });

    res.json({ message: 'Rol asignado exitosamente', role: updatedUser.role });
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar rol' });
  }
};

const bcrypt = require('bcrypt');

// POST /api/admin/users
const createUser = async (req, res) => {
  const { firstName, lastName, email, password, cedula, semester, role } = req.body;
  try {
    const isSuperAdmin = req.user.role === 'SUPERADMIN';
    // ADMIN normal no puede crear SUPERADMINs ni otros ADMINs (a menos que lo permitamos, pero es mejor restringirlo)
    if (!isSuperAdmin && (role === 'ADMIN' || role === 'SUPERADMIN')) {
      return res.status(403).json({ error: 'Solo los Súper Administradores pueden crear roles con altos privilegios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || '',
        email,
        password: hashedPassword,
        cedula: cedula || null,
        semester: semester || null,
        role: role || 'USER',
      }
    });
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, cedula, semester, role } = req.body;
  try {
    const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isSuperAdmin = req.user.role === 'SUPERADMIN';
    if (!isSuperAdmin && targetUser.role !== 'USER') {
      return res.status(403).json({ error: 'No tienes permisos para editar a este usuario' });
    }

    // Solo superadmin puede cambiar roles
    let updateData = { firstName, lastName: lastName || '', email, cedula: cedula || null, semester: semester || null };
    if (isSuperAdmin && role) {
      updateData.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    });
    res.json({ message: 'Usuario actualizado', user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isSuperAdmin = req.user.role === 'SUPERADMIN';
    if (!isSuperAdmin && targetUser.role !== 'USER') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar a este usuario' });
    }
    
    if (targetUser.role === 'SUPERADMIN') {
       return res.status(403).json({ error: 'No se puede eliminar a un Súper Administrador' });
    }

    // Eliminar los mensajes asociados al usuario para no violar la llave foránea
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: Number(id) },
          { receiverId: Number(id) }
        ]
      }
    });

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// GET /api/admin/weekly-stats
const getWeeklyStats = async (req, res) => {
  try {
    // Generar últimos 7 días
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0,0,0,0);
      return d;
    });

    const stats = await Promise.all(days.map(async (day, index) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const usersCount = await prisma.user.count({
        where: { createdAt: { gte: day, lt: nextDay } }
      });
      const roadmapsCount = await prisma.roadmap.count({
        where: { createdAt: { gte: day, lt: nextDay } }
      });

      const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' }); // lun, mar, mié
      return {
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        usuarios: usersCount,
        rutas: roadmapsCount
      };
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadísticas semanales' });
  }
};

module.exports = { getStats, getUsers, toggleUserStatus, assignRole, createUser, updateUser, deleteUser, getWeeklyStats };
