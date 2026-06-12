const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener historial de mensajes entre dos usuarios
const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: parseInt(otherUserId) },
          { senderId: parseInt(otherUserId), receiverId: currentUserId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener el historial de chat' });
  }
};

const saveMessage = async (senderId, receiverId, content, imageUrl) => {
  return await prisma.message.create({
    data: {
      senderId: parseInt(senderId),
      receiverId: parseInt(receiverId),
      content,
      imageUrl: imageUrl || null,
    },
  });
};

module.exports = { getMessages, saveMessage };
