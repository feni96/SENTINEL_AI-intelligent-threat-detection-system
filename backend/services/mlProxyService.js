const axios = require('axios');
const winston = require('winston');

class MLProxyService {
  constructor() {
    this.fastAPIBaseURL = process.env.FASTAPI_URL || 'http://localhost:8000';
    this.timeout = parseInt(process.env.ML_TIMEOUT) || 30000;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/mlProxy.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
      ]
    });
  }

  async predictIntrusion(inputData) {
    try {
      this.logger.info('Sending prediction request to FastAPI', { 
        featureCount: Object.keys(inputData).length 
      });

      const response = await axios.post(`${this.fastAPIBaseURL}/predict`, inputData, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' }
      });

      this.logger.info('Received prediction from FastAPI', { 
        attackType: response.data.attackType,
        confidence: response.data.confidence 
      });

      return response.data;
    } catch (error) {
      this.logger.error('FastAPI prediction request failed', { 
        error: error.message,
        code: error.code,
        status: error.response?.status 
      });
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      } else if (error.code === 'ECONNRESET') {
        throw new Error('ML service connection was reset');
      } else if (error.response) {
        throw new Error(`ML service error: ${error.response.data?.message || error.response.statusText}`);
      } else {
        throw new Error(`ML service error: ${error.message}`);
      }
    }
  }

  async predictBatch(inputDataList) {
    try {
      this.logger.info('Sending batch prediction request to FastAPI', { 
        batchSize: inputDataList.length 
      });

      const response = await axios.post(`${this.fastAPIBaseURL}/predict-batch`, {
        inputs: inputDataList
      }, {
        timeout: this.timeout * 2, // Allow more time for batch
        headers: { 'Content-Type': 'application/json' }
      });

      this.logger.info('Received batch predictions from FastAPI', { 
        resultCount: response.data.predictions?.length || 0 
      });

      return response.data;
    } catch (error) {
      this.logger.error('FastAPI batch prediction request failed', { 
        error: error.message,
        batchSize: inputDataList.length 
      });
      
      // Fallback to individual predictions if batch fails
      this.logger.warn('Batch failed, falling back to individual predictions');
      const predictions = [];
      
      for (const inputData of inputDataList) {
        try {
          const prediction = await this.predictIntrusion(inputData);
          predictions.push(prediction);
        } catch (individualError) {
          this.logger.error('Individual prediction failed in batch fallback', {
            error: individualError.message
          });
          predictions.push({
            attackType: 'Unknown',
            confidence: 0.0,
            riskLevel: 'MEDIUM',
            error: individualError.message
          });
        }
      }
      
      return { predictions };
    }
  }

  async getModelMetrics() {
    try {
      this.logger.info('Requesting model metrics from FastAPI');

      const response = await axios.get(`${this.fastAPIBaseURL}/models`, {
        timeout: 10000 // Shorter timeout for metrics
      });

      this.logger.info('Received model metrics from FastAPI');
      return response.data;
    } catch (error) {
      this.logger.error('FastAPI metrics request failed', { 
        error: error.message 
      });
      
      throw new Error(`Failed to get model metrics: ${error.message}`);
    }
  }

  async checkServiceHealth() {
    try {
      this.logger.info('Checking FastAPI service health');

      const response = await axios.get(`${this.fastAPIBaseURL}/health`, {
        timeout: 5000 // Short timeout for health check
      });

      const health = {
        status: 'healthy',
        fastapi_available: true,
        models_loaded: response.data.models_loaded || false,
        model_count: response.data.model_count || 0,
        uptime: response.data.uptime || 0,
        timestamp: new Date().toISOString()
      };

      this.logger.info('FastAPI service is healthy', health);
      return health;
    } catch (error) {
      this.logger.error('FastAPI health check failed', { 
        error: error.message 
      });
      
      return {
        status: 'unhealthy',
        fastapi_available: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getFeatureExamples() {
    try {
      this.logger.info('Requesting feature examples from FastAPI');

      const response = await axios.get(`${this.fastAPIBaseURL}/features-example`, {
        timeout: 10000
      });

      this.logger.info('Received feature examples from FastAPI');
      return response.data;
    } catch (error) {
      this.logger.error('FastAPI feature examples request failed', { 
        error: error.message 
      });
      
      throw new Error(`Failed to get feature examples: ${error.message}`);
    }
  }

  async toggleFallbackMode(enabled) {
    try {
      this.logger.info('Toggling fallback mode', { enabled });

      const response = await axios.post(`${this.fastAPIBaseURL}/fallback`, 
        { enabled }, 
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      this.logger.info('Fallback mode toggled successfully', { 
        enabled: response.data.fallback_enabled 
      });

      return response.data;
    } catch (error) {
      this.logger.error('FastAPI fallback toggle failed', { 
        error: error.message 
      });
      
      throw new Error(`Failed to toggle fallback mode: ${error.message}`);
    }
  }

  // Utility method to validate input before sending to FastAPI
  validateInput(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid input data format');
    }
    
    if (Object.keys(data).length === 0) {
      throw new Error('Input data cannot be empty');
    }
    
    // Check for potentially problematic data
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        this.logger.warn('Null or undefined value in input data', { key });
      }
      
      if (typeof value === 'number' && !isFinite(value)) {
        throw new Error(`Invalid numeric value for ${key}: ${value}`);
      }
    }
    
    return true;
  }
}

module.exports = new MLProxyService();
