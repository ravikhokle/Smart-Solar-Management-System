import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/solar_management';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${mongoURI}: ${error.message}`);
    console.warn(`[MongoDB Warning] Falling back to mock/in-memory data store for local MVP demonstration until MongoDB Atlas is configured.`);
    return null;
  }
};

export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    status: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][mongoose.connection.readyState] || 'Unknown',
    host: mongoose.connection.host || 'Mock In-Memory Store'
  };
};
