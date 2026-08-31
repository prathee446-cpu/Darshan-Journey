import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BACKEND_PORT = process.env.PORT || 5000;
const HEALTH_URL = `http://localhost:${BACKEND_PORT}/api/health`;
const HEALTH_TIMEOUT_MS = 30000;
const HEALTH_POLL_INTERVAL_MS = 300;

console.log('============================================================');
console.log('🕉️  DARSHAN JOURNEY - ADMIN STARTUP SEQUENCE');
console.log('============================================================');

let backendProcess = null;
let adminProcess = null;
let isShuttingDown = false;

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n🛑 Shutting down backend and admin processes...');

  if (adminProcess) {
    try {
      if (process.platform === 'win32' && adminProcess.pid) {
        spawn('taskkill', ['/pid', adminProcess.pid.toString(), '/f', '/t']);
      } else {
        adminProcess.kill('SIGTERM');
      }
    } catch (e) {}
  }

  if (backendProcess) {
    try {
      if (process.platform === 'win32' && backendProcess.pid) {
        spawn('taskkill', ['/pid', backendProcess.pid.toString(), '/f', '/t']);
      } else {
        backendProcess.kill('SIGTERM');
      }
    } catch (e) {}
  }

  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// 1. Check if health endpoint returns 200 with database: connected
function checkHealth() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, { timeout: 1500 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            if (parsed.status === 'ok' && parsed.database === 'connected') {
              return resolve({ ready: true, data: parsed });
            }
          }
          resolve({ ready: false, statusCode: res.statusCode });
        } catch (err) {
          resolve({ ready: false, error: err.message });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ ready: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ready: false, error: 'timeout' });
    });
  });
}

// 2. Poll until backend is fully healthy
async function waitForBackendReady() {
  const startTime = Date.now();
  console.log(`⏳ Waiting for Express backend and MongoDB connection on port ${BACKEND_PORT}...`);

  while (Date.now() - startTime < HEALTH_TIMEOUT_MS) {
    const result = await checkHealth();
    if (result.ready) {
      console.log('============================================================');
      console.log('MongoDB connected');
      console.log(`Backend ready on ${BACKEND_PORT}`);
      console.log('Admin ready on 5174');
      console.log('============================================================');
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, HEALTH_POLL_INTERVAL_MS));
  }

  throw new Error(`❌ Backend failed to become healthy within ${HEALTH_TIMEOUT_MS / 1000}s`);
}

async function main() {
  // Step 1: Start Express backend
  console.log('🔄 Starting Express backend (server/server.js)...');
  backendProcess = spawn('node', ['server/server.js'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: true
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Failed to start Express backend process:', err);
    cleanup();
  });

  backendProcess.on('exit', (code) => {
    if (!isShuttingDown && code !== 0) {
      console.error(`⚠️ Express backend process exited with code ${code}`);
    }
  });

  // Step 2: Wait for backend & MongoDB readiness
  try {
    await waitForBackendReady();
  } catch (err) {
    console.error(err.message);
    cleanup();
    return;
  }

  // Step 3: Start Admin Vite Frontend
  console.log('⚡ Starting Admin Vite frontend (admin/)...');
  adminProcess = spawn('npm', ['--prefix', 'admin', 'run', 'dev'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: true
  });

  adminProcess.on('error', (err) => {
    console.error('❌ Failed to start Admin Vite process:', err);
    cleanup();
  });

  adminProcess.on('exit', (code) => {
    if (!isShuttingDown && code !== 0) {
      console.error(`⚠️ Admin Vite process exited with code ${code}`);
    }
    cleanup();
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  cleanup();
});
