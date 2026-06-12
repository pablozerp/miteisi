const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const usersRoutes = require('./routes/usersRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true 
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AcademiCode Backend activo 🚀' });
});

const http = require('http');
const { Server } = require('socket.io');

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST']
  }
});

// Adjuntar io a app para usarlo en rutas/controladores
app.set('io', io);

const { saveMessage } = require('./controllers/chatController');

// Eventos básicos de Socket.io
io.on('connection', (socket) => {
  console.log('🔗 Cliente conectado a Socket.io:', socket.id);

  // Unirse a una sala específica de su ID para recibir mensajes directos
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`👤 Usuario ${userId} unido a su sala`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, content, imageUrl } = data;
      // Guardar en la base de datos
      const newMessage = await saveMessage(senderId, receiverId, content, imageUrl);
      
      // Emitir al receptor y al emisor
      io.to(receiverId.toString()).emit('receive_message', newMessage);
      io.to(senderId.toString()).emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error guardando el mensaje por socket:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ AcademiCode Backend corriendo en http://localhost:${PORT}`);
});
