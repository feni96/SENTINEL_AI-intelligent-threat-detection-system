/**
 * Offline State Management Service
 * Handles offline detection, action queuing, and sync on reconnect
 */

let isOffline = false;
let offlineQueue = [];
let offlineListeners = [];

/**
 * Initialize offline detection
 */
export const initOfflineDetection = () => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Check initial state
  if (!navigator.onLine) {
    handleOffline();
  }
};

/**
 * Handle going online
 */
const handleOnline = () => {
  console.log('✅ Back online');
  isOffline = false;
  notifyListeners('online');
  processOfflineQueue();
};

/**
 * Handle going offline
 */
const handleOffline = () => {
  console.log('❌ Going offline');
  isOffline = true;
  notifyListeners('offline');
};

/**
 * Check if currently online
 */
export const isOnline = () => {
  return navigator.onLine && !isOffline;
};

/**
 * Queue an action for offline processing
 */
export const queueOfflineAction = (action) => {
  if (!isOnline()) {
    console.log('📦 Queuing action for offline:', action.type);
    offlineQueue.push({
      ...action,
      timestamp: new Date(),
      id: Math.random().toString(36).substr(2, 9)
    });
    notifyListeners('queue-updated');
    return true;
  }
  return false;
};

/**
 * Process queued offline actions
 */
export const processOfflineQueue = async () => {
  if (offlineQueue.length === 0) {
    return;
  }

  console.log(`🔄 Processing ${offlineQueue.length} offline actions...`);
  notifyListeners('sync-start');

  let processedCount = 0;
  let failedCount = 0;

  while (offlineQueue.length > 0) {
    const action = offlineQueue[0];

    try {
      console.log(`Processing: ${action.type} (${action.id})`);

      switch (action.type) {
        case 'resolve-threat':
          await processThreatResolve(action);
          break;
        case 'false-positive-threat':
          await processThreatFalsePositive(action);
          break;
        case 'escalate-threat':
          await processThreatEscalate(action);
          break;
        case 'acknowledge-alert':
          await processAlertAcknowledge(action);
          break;
        case 'resolve-alert':
          await processAlertResolve(action);
          break;
        case 'escalate-alert':
          await processAlertEscalate(action);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }

      offlineQueue.shift();
      processedCount++;
      console.log(`✅ Action processed: ${action.type}`);
      notifyListeners('action-processed', { action, success: true });

    } catch (error) {
      failedCount++;
      console.error(`❌ Failed to process action: ${error.message}`);
      notifyListeners('action-failed', { action, error: error.message });
      break; // Stop processing on first failure
    }
  }

  console.log(`\n📊 Sync complete: ${processedCount} processed, ${failedCount} failed`);
  notifyListeners('sync-complete', { processedCount, failedCount });
};

/**
 * Process threat resolve action
 */
const processThreatResolve = async (action) => {
  const api = require('./api').default;
  await api.put(`/threats/${action.threatId}/resolve`, {
    resolutionNotes: action.data.resolutionNotes,
    status: 'Resolved'
  });
};

/**
 * Process threat false positive action
 */
const processThreatFalsePositive = async (action) => {
  const api = require('./api').default;
  await api.put(`/threats/${action.threatId}/false-positive`, {
    falsePositiveReason: action.data.reason
  });
};

/**
 * Process threat escalate action
 */
const processThreatEscalate = async (action) => {
  const api = require('./api').default;
  await api.put(`/threats/${action.threatId}/escalate`, {
    escalationNotes: action.data.notes
  });
};

/**
 * Process alert acknowledge action
 */
const processAlertAcknowledge = async (action) => {
  const api = require('./api').default;
  await api.put(`/alerts/${action.alertId}/acknowledge`);
};

/**
 * Process alert resolve action
 */
const processAlertResolve = async (action) => {
  const api = require('./api').default;
  await api.put(`/alerts/${action.alertId}/resolve`, {
    resolutionNotes: action.data.resolutionNotes
  });
};

/**
 * Process alert escalate action
 */
const processAlertEscalate = async (action) => {
  const api = require('./api').default;
  await api.put(`/alerts/${action.alertId}/escalate`, {
    escalationLevel: action.data.escalationLevel
  });
};

/**
 * Get offline queue size
 */
export const getOfflineQueueSize = () => offlineQueue.length;

/**
 * Get offline queue
 */
export const getOfflineQueue = () => [...offlineQueue];

/**
 * Clear offline queue
 */
export const clearOfflineQueue = () => {
  offlineQueue = [];
  notifyListeners('queue-cleared');
};

/**
 * Subscribe to offline state changes
 */
export const subscribeToOfflineChanges = (callback) => {
  offlineListeners.push(callback);
  return () => {
    offlineListeners = offlineListeners.filter(l => l !== callback);
  };
};

/**
 * Notify all listeners of state change
 */
const notifyListeners = (event, data = {}) => {
  offlineListeners.forEach(listener => {
    try {
      listener({ event, data, isOffline, queueSize: offlineQueue.length });
    } catch (error) {
      console.error('Error in offline listener:', error);
    }
  });
};

export default {
  initOfflineDetection,
  isOnline,
  queueOfflineAction,
  processOfflineQueue,
  getOfflineQueueSize,
  getOfflineQueue,
  clearOfflineQueue,
  subscribeToOfflineChanges
};
