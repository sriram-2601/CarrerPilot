import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { seedInitialData } from '../server/src/services/seedService.js';

let isReady = false;
let initPromise = null;

async function initialize() {
  if (isReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectDB();
        await seedInitialData();
        isReady = true;
      } catch (err) {
        console.error('[CareerPilot Vercel] Cold start initialization error:', err);
      }
    })();
  }
  await initPromise;
}

export default async function handler(req, res) {
  await initialize();

  // If Vercel rewrites stripped the '/api' prefix, prepend it so Express route handlers match correctly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    app(req, res, (err) => {
      if (err) {
        console.error('[CareerPilot Handler Error]:', err);
        return reject(err);
      }
      resolve();
    });
  });
}
