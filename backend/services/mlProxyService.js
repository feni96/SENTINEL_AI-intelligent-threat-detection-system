const axios = require('axios');
const winston = require('winston');

class MLProxyService {
  constructor() {
    this.fastAPIBaseURL = process.env.FASTAPI_URL || 'http://localhost:8000';
    this.timeout = parseInt(process.env.ML_TIMEOUT) || 10000;
    
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

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: this.fastAPIBaseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async predictIntrusion(networkData) {
    try {
      this.logger.info('Sending prediction request to FastAPI', { 
        featureCount: Object.keys(networkData).length 
      });

      const response = await this.axiosInstance.post('/predict', {
        data: networkData
      });

      this.logger.info('Received prediction from FastAPI', { 
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        threatLevel: response.data.threat_level
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

  async predictBatch(networkDataList) {
    try {
      if (!Array.isArray(networkDataList) || networkDataList.length === 0) {
        throw new Error('Batch input must be a non-empty array');
      }
      const response = await this.axiosInstance.post('/predict-batch', {
        data: networkDataList
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`ML service error: ${error.response?.data?.message || error.message}`);
    }
  }

  async trainModel(trainingData, modelType = 'threat_detection') {
    try {
      const response = await this.axiosInstance.post('/train', {
        training_data: trainingData,
        model_type: modelType
      });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`ML service error: ${error.response?.data?.message || error.message}`);
    }
  }

  async toggleFallbackMode(enabled) {
    try {
      const response = await this.axiosInstance.post('/fallback', { enabled });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`ML service error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getHealth() {
    try {
      this.logger.info('Checking FastAPI service health');

      const response = await this.axiosInstance.get('/health');

      const health = {
        status: response.data.status || 'healthy',
        fastapi_available: true,
        models: response.data.models || {},
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

  async getModels() {
    try {
      this.logger.info('Requesting available models from FastAPI');

      const response = await this.axiosInstance.get('/models');

      this.logger.info('Received models from FastAPI', { 
        modelCount: response.data.available_models?.length || 0 
      });

      return response.data;
    } catch (error) {
      this.logger.error('FastAPI models request failed', { 
        error: error.message 
      });
      
      throw new Error(`Failed to get models: ${error.message}`);
    }
  }

  async getSchemas() {
    try {
      this.logger.info('Requesting schemas from FastAPI');

      const response = await this.axiosInstance.get('/schemas');

      this.logger.info('Received schemas from FastAPI');
      return response.data;
    } catch (error) {
      this.logger.error('FastAPI schemas request failed', { 
        error: error.message 
      });
      
      throw new Error(`Failed to get schemas: ${error.message}`);
    }
  }

  async getVersion() {
    try {
      this.logger.info('Requesting version from FastAPI');

      const response = await this.axiosInstance.get('/version');

      this.logger.info('Received version from FastAPI');
      return response.data;
    } catch (error) {
      this.logger.error('FastAPI version request failed', { 
        error: error.message 
      });
      
      throw new Error(`Failed to get version: ${error.message}`);
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
