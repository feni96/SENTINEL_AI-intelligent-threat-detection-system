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

    // Handle zone-specific subscriptions
    socket.on('subscribeZone', (zoneName) => {
      socket.join(`zone_${zoneName}`);
      console.log(`User ${socket.user.username} subscribed to zone: ${zoneName}`);
    });

    socket.on('unsubscribeZone', (zoneName) => {
      socket.leave(`zone_${zoneName}`);
      console.log(`User ${socket.user.username} unsubscribed from zone: ${zoneName}`);
    });

    // Handle zone statistics requests
    socket.on('requestZoneStats', async () => {
      try {
        const Zone = require('../models/Zone');
        const stats = await Zone.aggregate([
          { $group: { _id: '$zoneType', count: { $sum: 1 } } }
        ]);
        socket.emit('zoneStats', stats);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch zone statistics' });
      }
    });
  });

  // Helper function to emit zone-based threat alerts
  io.emitZoneThreat = (zoneName, threatData) => {
    // Emit to general threat updates
    io.to('threat_updates').emit('threatDetected', threatData);
    
    // Emit to zone-specific room
    if (zoneName) {
      io.to(`zone_${zoneName}`).emit('zoneThreatDetected', {
        ...threatData,
        zone: zoneName
      });
    }
    
    // Emit to admin room
    io.to('admin_room').emit('adminThreatAlert', threatData);
  };

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
