import React, { useState, useEffect } from 'react';
import { isOnline, getOfflineQueueSize, subscribeToOfflineChanges } from '../services/offline';

export default function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Subscribe to offline changes
    const unsubscribe = subscribeToOfflineChanges((state) => {
      setOnline(!state.isOffline);
      setQueueSize(state.queueSize);

      if (state.event === 'sync-start') {
        setSyncing(true);
      } else if (state.event === 'sync-complete') {
        setSyncing(false);
      }
    });

    // Initial state
    setOnline(isOnline());
    setQueueSize(getOfflineQueueSize());

    return () => unsubscribe();
  }, []);

  // Don't show if online and no queue
  if (online && queueSize === 0 && !syncing) {
    return null;
  }

  const getStatusText = () => {
    if (syncing) {
      return `🔄 Syncing... (${queueSize} pending)`;
    }
    if (!online) {
      return `🔴 Offline - Changes will sync when online`;
    }
    if (queueSize > 0) {
      return `🟡 Online (${queueSize} pending)`;
    }
    return '✅ Online';
  };

  const getBackgroundColor = () => {
    if (syncing) return '#3b82f6'; // Blue
    if (!online) return '#ef4444'; // Red
    if (queueSize > 0) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '6px',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: '500',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: syncing ? 'pulse 1s infinite' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {getStatusText()}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
