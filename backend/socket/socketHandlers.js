const { getIO } = require('./socketServer');

const emitNewThreat = (threatData) => {
  try {
    const io = getIO();
    
    // Emit to all users subscribed to threat updates
    io.to('threat_updates').emit('newThreat', {
      id: threatData._id,
      threatType: threatData.threatType,
      prediction: threatData.mlPrediction?.prediction,
      confidence: threatData.mlPrediction?.confidence,
      riskScore: threatData.mlPrediction?.risk_score,
      threatLevel: threatData.mlPrediction?.threat_level,
      branchUsed: threatData.mlPrediction?.branch_used,
      modelUsed: threatData.mlPrediction?.model_used,
      inferenceTime: threatData.mlPrediction?.inference_time_ms,
      sourceIP: threatData.sourceIP,
      timestamp: threatData.timestamp,
      severityLevel: threatData.severityLevel,
      status: threatData.status
    });

    // Also emit to admin room for immediate notification
    io.to('admin_room').emit('adminThreatAlert', {
      threatId: threatData._id,
      threatType: threatData.threatType,
      threatLevel: threatData.mlPrediction?.threat_level,
      sourceIP: threatData.sourceIP,
      timestamp: threatData.timestamp,
      requiresAttention: threatData.mlPrediction?.threat_level === 'CRITICAL' || 
                        threatData.mlPrediction?.threat_level === 'HIGH'
    });

    console.log(`New threat emitted: ${threatData.threatType} from ${threatData.sourceIP}`);
  } catch (error) {
    console.error('Error emitting new threat:', error);
  }
};

const emitThreatUpdate = (threatId, updateData) => {
  try {
    const io = getIO();
    
    io.to('threat_updates').emit('threatUpdate', {
      threatId,
      ...updateData,
      timestamp: new Date()
    });

    console.log(`Threat update emitted: ${threatId}`);
  } catch (error) {
    console.error('Error emitting threat update:', error);
  }
};

const emitMLServiceHealth = (healthData) => {
  try {
    const io = getIO();
    
    io.to('admin_room').emit('mlServiceHealth', {
      status: healthData.status,
      available: healthData.fastapi_available,
      models: healthData.models,
      timestamp: healthData.timestamp
    });

    console.log(`ML service health emitted: ${healthData.status}`);
  } catch (error) {
    console.error('Error emitting ML service health:', error);
  }
};

const emitThreatStats = (statsData) => {
  try {
    const io = getIO();
    
    io.to('threat_updates').emit('threatStats', {
      totalThreats: statsData.totalThreats,
      criticalThreats: statsData.criticalThreats,
      highThreats: statsData.highThreats,
      mediumThreats: statsData.mediumThreats,
      lowThreats: statsData.lowThreats,
      recentThreats: statsData.recentThreats,
      topThreatTypes: statsData.topThreatTypes,
      timestamp: statsData.timestamp
    });

    console.log('Threat stats emitted');
  } catch (error) {
    console.error('Error emitting threat stats:', error);
  }
};

const emitSystemAlert = (alertData) => {
  try {
    const io = getIO();
    
    io.emit('systemAlert', {
      type: alertData.type,
      message: alertData.message,
      severity: alertData.severity,
      timestamp: new Date()
    });

    console.log(`System alert emitted: ${alertData.type}`);
  } catch (error) {
    console.error('Error emitting system alert:', error);
  }
};

module.exports = {
  emitNewThreat,
  emitThreatUpdate,
  emitMLServiceHealth,
  emitThreatStats,
  emitSystemAlert
};
