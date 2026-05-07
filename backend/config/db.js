const mongoose = require('mongoose');
const winston = require('winston');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    winston.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      winston.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      winston.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      winston.info('MongoDB reconnected');
    });

  } catch (error) {
    winston.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    winston.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    winston.error(`Error during MongoDB shutdown: ${error.message}`);
    process.exit(1);
  }
});

module.exports = connectDB;
