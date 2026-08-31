import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BACKEND_PORT = process.env.PORT || 5000;
const VITE_PORT = 3000;

console.log('============================================================');
console.log('🕉️   DARSHAN JOURNEY - UNIFIED FULL-STACK STARTUP');
console.log('============================================================');
console.log('📦 Starting Express Backend (Port 5000) & Vite Frontend (Port 3000)...');

let backendProcess = null;
let viteProcess = null;
let isShuttingDown = false;

function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n🛑 Gracefully shutting down all Darshan Journey processes...');

  const killProcess = (proc) => {
    if (!proc || !proc.pid) return;
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
      } else {
        proc.kill('SIGTERM');
      }
    } catch (e) {}
  };

  killProcess(backendProcess);
  killProcess(viteProcess);

  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught exception:', err.message);
  cleanup();
});

// Step 1: Start Express Backend Process
backendProcess = spawn('node', ['server/server.js'], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: BACKEND_PORT.toString() }
});

backendProcess.on('error', (err) => {
  console.error('❌ Failed to start Express backend process:', err);
  cleanup();
});

backendProcess.on('exit', (code) => {
  if (!isShuttingDown && code !== 0 && code !== null) {
    console.error(`⚠️ Express backend process exited with code ${code}`);
  }
});

// Step 2: Start Vite Frontend Process
viteProcess = spawn('npx', ['vite', '--port', VITE_PORT.toString(), '--strictPort'], {
  cwd: ROOT_DIR,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

viteProcess.on('error', (err) => {
  console.error('❌ Failed to start Vite frontend process:', err);
  cleanup();
});

viteProcess.on('exit', (code) => {
  if (!isShuttingDown && code !== 0 && code !== null) {
    console.error(`⚠️ Vite frontend process exited with code ${code}`);
  }
});
