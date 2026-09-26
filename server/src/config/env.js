import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'careerpilot-dev-jwt-secret-key-32charsmin',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_CHAT_MODEL: process.env.OLLAMA_CHAT_MODEL || 'llama3.1:8b',
  OLLAMA_EMBED_MODEL: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
  ENABLE_LIVE_DISCOVERY: process.env.ENABLE_LIVE_DISCOVERY === 'false' ? false : true,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
