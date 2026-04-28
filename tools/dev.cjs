#!/usr/bin/env node
// ============================================================
// Dev runner — angular-figma-demo
// ------------------------------------------------------------
// Avvia in parallelo:
//   - npm run api    (dev-api con --watch, porta 4201)
//   - npm start      (ng serve, porta 4200)
//
// Output dei due processi prefissato per riconoscibilità.
// CTRL+C uccide entrambi.
//
// Uso: npm run dev
// ============================================================

const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const ESC = String.fromCharCode(27);
const COLORS = {
  api: `${ESC}[35m`, // magenta
  ng:  `${ESC}[36m`, // cyan
  dev: `${ESC}[33m`, // yellow
  reset: `${ESC}[0m`,
};

const procs = [];
let shuttingDown = false;

function prefix(label, color, line) {
  return `${color}[${label}]${COLORS.reset} ${line}`;
}

function pipe(stream, label, color) {
  let buf = '';
  stream.on('data', (chunk) => {
    buf += chunk.toString();
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (line.length > 0) {
        // eslint-disable-next-line no-console
        console.log(prefix(label, color, line));
      }
    }
  });
}

function start(label, color, args) {
  const child = spawn(npmCmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  procs.push(child);

  pipe(child.stdout, label, color);
  pipe(child.stderr, label, color);

  child.on('exit', (code) => {
    if (shuttingDown) return;
    // eslint-disable-next-line no-console
    console.log(prefix(label, color, `exited with code ${code}`));
    shutdown(code ?? 1);
  });
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const p of procs) {
    if (p && !p.killed) {
      try { p.kill('SIGINT'); } catch { /* ignore */ }
    }
  }
  setTimeout(() => process.exit(code), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start('api', COLORS.api, ['run', 'api']);
start('ng',  COLORS.ng,  ['start']);

// eslint-disable-next-line no-console
console.log(prefix('dev', COLORS.dev, 'avviati api (4201) + ng serve (4200). CTRL+C per terminare.'));
