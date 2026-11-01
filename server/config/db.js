import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
      authSource: 'admin',
      serverSelectionTimeoutMS: 15000,
    });

    // Ensure database indexes (including unique constraints) are synced
    try {
      const { Customer } = await import('../models/Customer.js');
      await Customer.syncIndexes();
    } catch (idxErr) {
      console.warn('Index sync notice:', idxErr.message);
    }
  } catch (error) {
    if (error?.code === 8000 || error?.message?.includes('Authentication failed')) {
      throw new Error(
        'MongoDB authentication failed. Reset the Atlas database-user password, URL-encode it if it contains reserved characters, and update server/.env (MONGODB_URI).'
      );
    }
    throw error;
  }
  return mongoose.connection;
}
