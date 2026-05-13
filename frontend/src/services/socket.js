import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.IO connection with authentication
 * @param {string} token - JWT authentication token
 * @returns {Socket} Socket.IO client instance
 */
export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return socket;
  }

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id);
    // Auto-subscribe to threat updates
    socket.emit('subscribeThreats');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Socket.IO reconnected after ${attemptNumber} attempts`);
    // Re-subscribe to threat updates after reconnection
    socket.emit('subscribeThreats');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket.IO reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket.IO reconnection failed');
  });

  return socket;
};

/**
 * Get the current socket instance
 * @returns {Socket|null} Socket.IO client instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.emit('unsubscribeThreats');
    socket.disconnect();
    socket = null;
    console.log('Socket.IO disconnected manually');
  }
};

/**
 * Subscribe to threat updates
 */
export const subscribeToThreats = () => {
  if (socket && socket.connected) {
    socket.emit('subscribeThreats');
    console.log('Subscribed to threat updates');
  }
};

/**
 * Unsubscribe from threat updates
 */
export const unsubscribeFromThreats = () => {
  if (socket && socket.connected) {
    socket.emit('unsubscribeThreats');
    console.log('Unsubscribed from threat updates');
  }
};

/**
 * Listen for new threat events
 * @param {Function} callback - Callback function to handle new threat data
 */
export const onNewThreat = (callback) => {
  if (socket) {
    socket.on('newThreat', callback);
  }
};

/**
 * Listen for threat update events
 * @param {Function} callback - Callback function to handle threat update data
 */
export const onThreatUpdate = (callback) => {
  if (socket) {
    socket.on('threatUpdate', callback);
  }
};

/**
 * Listen for ML service health events
 * @param {Function} callback - Callback function to handle ML service health data
 */
export const onMLServiceHealth = (callback) => {
  if (socket) {
    socket.on('mlServiceHealth', callback);
  }
};

/**
 * Listen for threat statistics events
 * @param {Function} callback - Callback function to handle threat stats data
 */
export const onThreatStats = (callback) => {
  if (socket) {
    socket.on('threatStats', callback);
  }
};

/**
 * Listen for system alert events
 * @param {Function} callback - Callback function to handle system alert data
 */
export const onSystemAlert = (callback) => {
  if (socket) {
    socket.on('systemAlert', callback);
  }
};

/**
 * Listen for admin threat alert events
 * @param {Function} callback - Callback function to handle admin threat alert data
 */
export const onAdminThreatAlert = (callback) => {
  if (socket) {
    socket.on('adminThreatAlert', callback);
  }
};

/**
 * Listen for connection stats update events
 * @param {Function} callback - Callback function to handle connection stats data
 */
export const onConnectionStatsUpdate = (callback) => {
  if (socket) {
    socket.on('connectionStatsUpdate', callback);
  }
};

/**
 * Listen for traffic update events
 * @param {Function} callback - Callback function to handle traffic data
 */
export const onTrafficUpdate = (callback) => {
  if (socket) {
    socket.on('trafficUpdate', callback);
  }
};

/**
 * Listen for zone activity update events
 * @param {Function} callback - Callback function to handle zone activity data
 */
export const onZoneActivityUpdate = (callback) => {
  if (socket) {
    socket.on('zoneActivityUpdate', callback);
  }
};

/**
 * Listen for alert created events
 * @param {Function} callback - Callback function to handle alert created data
 */
export const onAlertCreated = (callback) => {
  if (socket) {
    socket.on('alertCreated', callback);
  }
};

/**
 * Listen for alert acknowledged events
 * @param {Function} callback - Callback function to handle alert acknowledged data
 */
export const onAlertAcknowledged = (callback) => {
  if (socket) {
    socket.on('alertAcknowledged', callback);
  }
};

/**
 * Remove event listener
 * @param {string} eventName - Name of the event
 * @param {Function} callback - Callback function to remove
 */
export const offEvent = (eventName, callback) => {
  if (socket) {
    socket.off(eventName, callback);
  }
};

/**
 * Remove all listeners for an event
 * @param {string} eventName - Name of the event
 */
export const removeAllListeners = (eventName) => {
  if (socket) {
    socket.removeAllListeners(eventName);
  }
};

/**
 * Create dashboard socket connection (legacy compatibility)
 * This is a wrapper around initializeSocket for backward compatibility
 * @param {string} token - JWT authentication token
 * @returns {Socket} Socket.IO client instance
 */
export const createDashboardSocket = (token) => {
  return initializeSocket(token);
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  subscribeToThreats,
  unsubscribeFromThreats,
  onNewThreat,
  onThreatUpdate,
  onMLServiceHealth,
  onThreatStats,
  onSystemAlert,
  onAdminThreatAlert,
  onConnectionStatsUpdate,
  onTrafficUpdate,
  onZoneActivityUpdate,
  onAlertCreated,
  onAlertAcknowledged,
  offEvent,
  removeAllListeners,
  createDashboardSocket
};
