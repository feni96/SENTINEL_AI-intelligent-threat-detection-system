const axios = require('axios');
const winston = require('winston');

class MLService {
  constructor() {
    this.pythonMLServiceURL = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:5000';
    this.fallbackEnabled = true;
    this.requestTimeout = 10000; // 10 seconds
  }

  // Extract features from network log for ML prediction
  extractFeatures(networkLog) {
    const features = {
      // Basic network features
      packetSize: networkLog.packetSize || 0,
      sourcePort: networkLog.sourcePort || 0,
      destinationPort: networkLog.destinationPort || 0,
      
      // Time-based features
      hourOfDay: new Date(networkLog.timestamp).getHours(),
      dayOfWeek: new Date(networkLog.timestamp).getDay(),
      
      // Protocol encoding (one-hot style)
      protocol_TCP: networkLog.protocol === 'TCP' ? 1 : 0,
      protocol_UDP: networkLog.protocol === 'UDP' ? 1 : 0,
      protocol_ICMP: networkLog.protocol === 'ICMP' ? 1 : 0,
      protocol_HTTP: networkLog.protocol === 'HTTP' ? 1 : 0,
      protocol_HTTPS: networkLog.protocol === 'HTTPS' ? 1 : 0,
      protocol_FTP: networkLog.protocol === 'FTP' ? 1 : 0,
      protocol_SSH: networkLog.protocol === 'SSH' ? 1 : 0,
      protocol_DNS: networkLog.protocol === 'DNS' ? 1 : 0,
      protocol_SMTP: networkLog.protocol === 'SMTP' ? 1 : 0,
      protocol_OTHER: networkLog.protocol === 'OTHER' ? 1 : 0,
      
      // Action encoding
      action_ALLOW: networkLog.action === 'ALLOW' ? 1 : 0,
      action_DENY: networkLog.action === 'DENY' ? 1 : 0,
      action_DROP: networkLog.action === 'DROP' ? 1 : 0,
      action_LOG: networkLog.action === 'LOG' ? 1 : 0,
      action_ALERT: networkLog.action === 'ALERT' ? 1 : 0,
      
      // Status encoding
      status_SUCCESS: networkLog.status === 'SUCCESS' ? 1 : 0,
      status_FAILED: networkLog.status === 'FAILED' ? 1 : 0,
      status_TIMEOUT: networkLog.status === 'TIMEOUT' ? 1 : 0,
      status_REJECTED: networkLog.status === 'REJECTED' ? 1 : 0,
      status_PENDING: networkLog.status === 'PENDING' ? 1 : 0,
      
      // IP-based features
      sourceIPClass: this.getIPClass(networkLog.sourceIP),
      destinationIPClass: this.getIPClass(networkLog.destinationIP),
      isPrivateSourceIP: this.isPrivateIP(networkLog.sourceIP) ? 1 : 0,
      isPrivateDestinationIP: this.isPrivateIP(networkLog.destinationIP) ? 1 : 0,
      
      // Port-based features
      isWellKnownPort: this.isWellKnownPort(networkLog.destinationPort) ? 1 : 0,
      isHighRiskPort: this.isHighRiskPort(networkLog.destinationPort) ? 1 : 0,
      isSystemPort: this.isSystemPort(networkLog.destinationPort) ? 1 : 0,
      
      // Payload features
      hasPayload: networkLog.payload && networkLog.payload.length > 0 ? 1 : 0,
      payloadLength: networkLog.payload ? networkLog.payload.length : 0,
      
      // Flag features
      hasSYN: networkLog.flags && networkLog.flags.includes('SYN') ? 1 : 0,
      hasACK: networkLog.flags && networkLog.flags.includes('ACK') ? 1 : 0,
      hasFIN: networkLog.flags && networkLog.flags.includes('FIN') ? 1 : 0,
      hasRST: networkLog.flags && networkLog.flags.includes('RST') ? 1 : 0,
      hasURG: networkLog.flags && networkLog.flags.includes('URG') ? 1 : 0,
      hasPSH: networkLog.flags && networkLog.flags.includes('PSH') ? 1 : 0,
      
      // Composite features
      portDifference: Math.abs((networkLog.sourcePort || 0) - (networkLog.destinationPort || 0)),
      isSamePort: (networkLog.sourcePort || 0) === (networkLog.destinationPort || 0) ? 1 : 0,
      packetSizeCategory: this.getPacketSizeCategory(networkLog.packetSize || 0)
    };

    return features;
  }

  // Get IP class (A, B, C)
  getIPClass(ip) {
    if (!ip) return 0;
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 1 && firstOctet <= 126) return 1; // Class A
    if (firstOctet >= 128 && firstOctet <= 191) return 2; // Class B
    if (firstOctet >= 192 && firstOctet <= 223) return 3; // Class C
    if (firstOctet >= 224 && firstOctet <= 239) return 4; // Class D
    if (firstOctet >= 240 && firstOctet <= 255) return 5; // Class E
    return 0;
  }

  // Check if IP is private
  isPrivateIP(ip) {
    if (!ip) return false;
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./
    ];
    return privateRanges.some(range => range.test(ip));
  }

  // Check if port is well-known (0-1023)
  isWellKnownPort(port) {
    return port >= 0 && port <= 1023;
  }

  // Check if port is high-risk
  isHighRiskPort(port) {
    const highRiskPorts = [22, 23, 80, 443, 1433, 3306, 3389, 5432, 21, 25, 53, 110, 143, 993, 995];
    return highRiskPorts.includes(port);
  }

  // Check if port is system port (0-1023)
  isSystemPort(port) {
    return port >= 0 && port <= 1023;
  }

  // Get packet size category
  getPacketSizeCategory(size) {
    if (size <= 64) return 1;
    if (size <= 256) return 2;
    if (size <= 512) return 3;
    if (size <= 1024) return 4;
    if (size <= 1500) return 5;
    if (size <= 4000) return 6;
    return 7; // > 4000
  }

  // Predict threat using ML service
  async predictThreat(networkLog) {
    try {
      const features = this.extractFeatures(networkLog);
      
      // Try to call Python ML service
      const response = await axios.post(`${this.pythonMLServiceURL}/predict`, {
        features,
        timestamp: networkLog.timestamp,
        log_id: networkLog._id
      }, {
        timeout: this.requestTimeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const prediction = response.data;
      
      return {
        threatType: prediction.threat_type || 'Anomaly',
        confidenceScore: prediction.confidence_score || 75,
        severityLevel: this.mapSeverityFromScore(prediction.confidence_score || 75),
        description: prediction.description || `ML model detected ${prediction.threat_type || 'anomaly'}`,
        model: prediction.model || 'default',
        features: features,
        predictionId: prediction.prediction_id,
        processingTime: prediction.processing_time
      };

    } catch (error) {
      winston.warn(`ML service prediction failed: ${error.message}`);
      
      if (this.fallbackEnabled) {
        return this.fallbackPrediction(networkLog);
      }
      
      throw new Error(`ML service unavailable: ${error.message}`);
    }
  }

  // Fallback prediction when ML service is unavailable
  fallbackPrediction(networkLog) {
    const features = this.extractFeatures(networkLog);
    
    // Simple rule-based fallback
    let threatScore = 0;
    let threatType = 'Normal';
    
    // Packet size analysis
    if (features.packetSize > 2000) {
      threatScore += 30;
      threatType = 'DDoS';
    }
    
    // Failed connections
    if (features.status_FAILED === 1) {
      threatScore += 25;
      if (features.destinationPort === 22) {
        threatType = 'Brute Force';
      }
    }
    
    // High-risk ports
    if (features.isHighRiskPort === 1 && features.action_DENY === 1) {
      threatScore += 35;
      threatType = 'Port Scan';
    }
    
    // Unusual protocols
    if (features.protocol_ICMP === 1 && features.packetSize > 1000) {
      threatScore += 20;
      threatType = 'Anomaly';
    }
    
    // Private to external traffic
    if (features.isPrivateSourceIP === 1 && features.isPrivateDestinationIP === 0 && features.packetSize > 1500) {
      threatScore += 40;
      threatType = 'Data Exfiltration';
    }
    
    const confidenceScore = Math.min(threatScore, 95);
    
    if (threatScore > 50) {
      return {
        threatType,
        confidenceScore,
        severityLevel: this.mapSeverityFromScore(confidenceScore),
        description: `Fallback detection: ${threatType}`,
        model: 'fallback_rules',
        features,
        fallback: true
      };
    }
    
    return null; // No threat detected
  }

  // Map confidence score to severity level
  mapSeverityFromScore(score) {
    if (score >= 90) return 'Critical';
    if (score >= 75) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  }

  // Batch prediction for multiple logs
  async predictBatch(networkLogs) {
    try {
      const featuresList = networkLogs.map(log => ({
        log_id: log._id,
        features: this.extractFeatures(log),
        timestamp: log.timestamp
      }));

      const response = await axios.post(`${this.pythonMLServiceURL}/predict_batch`, {
        logs: featuresList
      }, {
        timeout: this.requestTimeout * 2, // Longer timeout for batch
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.predictions;

    } catch (error) {
      winston.warn(`Batch ML prediction failed: ${error.message}`);
      
      // Fallback to individual predictions
      const predictions = [];
      for (const log of networkLogs) {
        try {
          const prediction = await this.predictThreat(log);
          predictions.push({
            log_id: log._id,
            prediction: prediction
          });
        } catch (err) {
          predictions.push({
            log_id: log._id,
            error: err.message
          });
        }
      }
      
      return predictions;
    }
  }

  // Train model with new data
  async trainModel(trainingData) {
    try {
      const response = await axios.post(`${this.pythonMLServiceURL}/train`, {
        training_data: trainingData,
        model_type: 'threat_detection'
      }, {
        timeout: 60000, // 1 minute timeout for training
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        modelId: response.data.model_id,
        accuracy: response.data.accuracy,
        trainingTime: response.data.training_time
      };

    } catch (error) {
      winston.error(`ML model training failed: ${error.message}`);
      throw new Error(`Model training failed: ${error.message}`);
    }
  }

  // Get model performance metrics
  async getModelMetrics() {
    try {
      const response = await axios.get(`${this.pythonMLServiceURL}/metrics`, {
        timeout: this.requestTimeout
      });

      return response.data;

    } catch (error) {
      winston.warn(`Failed to get ML model metrics: ${error.message}`);
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1_score: 0,
        model_version: 'unknown',
        last_trained: null
      };
    }
  }

  // Check if ML service is available
  async checkServiceHealth() {
    try {
      const response = await axios.get(`${this.pythonMLServiceURL}/health`, {
        timeout: 5000
      });
      
      return {
        available: true,
        status: response.data.status || 'healthy',
        version: response.data.version,
        uptime: response.data.uptime
      };

    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  // Enable/disable fallback mode
  setFallbackMode(enabled) {
    this.fallbackEnabled = enabled;
    winston.info(`ML fallback mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create singleton instance
const mlService = new MLService();

module.exports = mlService;
