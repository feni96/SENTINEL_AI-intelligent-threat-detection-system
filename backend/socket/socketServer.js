const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  // Parse CORS origins from environment variable
  const corsOrigins = process.env.SOCKET_CORS_ORIGIN 
    ? process.env.SOCKET_CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ["http://localhost:3000"];

  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const userId = decoded.userId || decoded.id;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Join user to their personal room for targeted notifications
    socket.join(`user_${socket.user._id}`);
    
    // Join to admin room if user is admin
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
    });

    // Handle real-time threat subscription
    socket.on('subscribeThreats', () => {
      socket.join('threat_updates');
      console.log(`User ${socket.user.username} subscribed to threat updates`);
    });

    // Handle unsubscribe from threat updates
    socket.on('unsubscribeThreats', () => {
      socket.leave('threat_updates');
      console.log(`User ${socket.user.username} unsubscribed from threat updates`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
