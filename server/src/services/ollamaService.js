import axios from 'axios';
import { env } from '../config/env.js';

export async function generateLocalText(prompt) {
  try {
    const response = await axios.post(
      `${env.OLLAMA_BASE_URL}/api/generate`,
      {
        model: env.OLLAMA_CHAT_MODEL,
        prompt,
        stream: false
      },
      { timeout: 8000 }
    );

    if (response.data && response.data.response) {
      return response.data.response.trim();
    }
    return '';
  } catch (err) {
    // Graceful offline fallback trigger: return empty string
    return '';
  }
}

export async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      `${env.OLLAMA_BASE_URL}/api/embeddings`,
      {
        model: env.OLLAMA_EMBED_MODEL,
        prompt: text
      },
      { timeout: 8000 }
    );

    if (response.data && Array.isArray(response.data.embedding)) {
      return response.data.embedding;
    }
    return [];
  } catch (err) {
    // Graceful offline fallback trigger: return empty array
    return [];
  }
}

export async function checkOllamaHealth() {
  try {
    const res = await axios.get(`${env.OLLAMA_BASE_URL}/api/tags`, { timeout: 2000 });
    return res.status === 200;
  } catch {
    return false;
  }
}
