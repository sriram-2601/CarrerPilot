import mongoose from 'mongoose';
import { env } from './env.js';

export const dbState = {
  mode: 'memory',
  connected: false
};

export async function connectDB() {
  if (!env.MONGODB_URI || env.MONGODB_URI.trim() === '') {
    dbState.mode = 'memory';
    dbState.connected = true;
    console.log('[CareerPilot Storage] MONGODB_URI not provided. Running in resilient In-Memory storage mode.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    dbState.mode = 'mongo';
    dbState.connected = true;
    console.log('[CareerPilot Storage] Connected successfully to MongoDB.');
  } catch (error) {
    dbState.mode = 'memory';
    dbState.connected = false;
    console.warn(`[CareerPilot Storage] Failed to connect to MongoDB (${error.message}). Falling back to In-Memory mode.`);
  }
}
