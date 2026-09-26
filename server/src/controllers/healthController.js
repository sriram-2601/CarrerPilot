import { dbState } from '../config/db.js';
import { checkOllamaHealth } from '../services/ollamaService.js';

export const healthController = {
  async getHealth(req, res) {
    const isOllamaRunning = await checkOllamaHealth();

    res.json({
      status: 'ok',
      service: 'CareerPilot AI API',
      timestamp: new Date().toISOString(),
      storageMode: dbState.mode,
      aiRuntime: isOllamaRunning ? 'Ollama Local LLM (llama3.1:8b)' : 'Deterministic Offline-First Fallback',
      ollamaAvailable: isOllamaRunning,
      autoApplyEnabled: false
    });
  }
};
