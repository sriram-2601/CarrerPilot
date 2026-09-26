import app from './app.js';
import { env } from './config/env.js';
import { connectDB, dbState } from './config/db.js';
import { seedInitialData } from './services/seedService.js';
import { startBackgroundJobs } from './jobs/cron.js';

async function bootstrap() {
  try {
    console.log('----------------------------------------------------');
    console.log(' Starting CareerPilot AI - Agentic Internship CRM   ');
    console.log('----------------------------------------------------');

    // 1. Initialize storage (MongoDB or resilient In-Memory fallback)
    await connectDB();
    console.log(`[CareerPilot] Storage engine active: ${dbState.mode.toUpperCase()}`);

    // 2. Auto-seed initial internships and demo student account
    await seedInitialData();

    // 3. Start background job scheduler
    startBackgroundJobs();

    // 4. Start HTTP Server
    const port = env.PORT;
    const server = app.listen(port, () => {
      console.log(`[CareerPilot] Server listening on http://localhost:${port}`);
      console.log(`[CareerPilot] Environment: ${env.NODE_ENV}`);
      console.log(`[CareerPilot] Ready to process student agentic workflows.`);
      console.log('----------------------------------------------------');
    });

    const shutdown = () => {
      console.log('\n[CareerPilot] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[CareerPilot] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[CareerPilot Boot Error] Fatal error during startup:', error);
    process.exit(1);
  }
}

bootstrap();
