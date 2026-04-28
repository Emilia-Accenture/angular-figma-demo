#!/usr/bin/env node
// ============================================================
// pipeline-state — CLI helper per output/pipeline-state.json
// ------------------------------------------------------------
// Misura i tempi delle fasi con timestamp reali e mantiene
// coerente lo schema usato da PipelineStateService.
//
// L'orchestratore /figma-pipeline DEVE chiamarlo a ogni
// transizione di fase invece di scrivere il file a mano.
// Così i tempi sono wall-clock veri (non stime), e la home
// vede l'aggiornamento immediatamente.
//
// Uso:
//   node tools/pipeline-state.cjs begin   <feature>
//   node tools/pipeline-state.cjs phase   <phaseId>
//   node tools/pipeline-state.cjs done
//   node tools/pipeline-state.cjs error   [phaseId]
//   node tools/pipeline-state.cjs reset
//
// Stato locale: il timestamp di inizio fase è derivato da
// `updatedAt` dell'ultimo write, quindi il file stesso è la
// fonte di verità (no extra file di lock).
// ============================================================

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PROJECT_ROOT, 'output', 'pipeline-state.json');

const VALID_PHASES = new Set([
  '0', '1-2', '3', '3.5', '4', '5', '6', '7', '8', '9',
]);

function readState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function idleState() {
  return {
    feature: null,
    currentPhase: null,
    status: 'idle',
    updatedAt: new Date().toISOString(),
    startedAt: null,
    phaseTimes: {},
    totalTimeMs: null,
  };
}

function elapsedSinceUpdated(state, now) {
  if (!state || !state.updatedAt) return 0;
  const t = Date.parse(state.updatedAt);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, now - t);
}

function closeCurrentPhase(state, now) {
  if (!state.currentPhase) return;
  const delta = elapsedSinceUpdated(state, now);
  state.phaseTimes[state.currentPhase] =
    (state.phaseTimes[state.currentPhase] ?? 0) + delta;
}

function cmdBegin(feature) {
  if (!feature) die('feature richiesta: pipeline-state.cjs begin <feature>');
  const now = Date.now();
  const isoNow = new Date(now).toISOString();
  const state = {
    feature,
    currentPhase: '0',
    status: 'running',
    updatedAt: isoNow,
    startedAt: isoNow,
    phaseTimes: {},
    totalTimeMs: null,
  };
  writeState(state);
  log(`begin feature=${feature} phase=0 at ${isoNow}`);
}

function cmdPhase(phaseId) {
  if (!phaseId) die('phaseId richiesto: pipeline-state.cjs phase <id>');
  if (!VALID_PHASES.has(phaseId)) die(`phaseId non valido: ${phaseId}`);
  const state = readState();
  if (!state || !state.feature) {
    die('nessuna pipeline in corso. Esegui prima: pipeline-state.cjs begin <feature>');
  }
  const now = Date.now();
  closeCurrentPhase(state, now);
  state.currentPhase = phaseId;
  state.status = 'running';
  state.updatedAt = new Date(now).toISOString();
  writeState(state);
  log(`phase=${phaseId} at ${state.updatedAt}`);
}

function cmdDone() {
  const state = readState();
  if (!state || !state.feature) die('nessuna pipeline in corso.');
  const now = Date.now();
  closeCurrentPhase(state, now);
  state.status = 'done';
  state.updatedAt = new Date(now).toISOString();
  state.totalTimeMs = state.startedAt
    ? Math.max(0, now - Date.parse(state.startedAt))
    : null;
  writeState(state);
  log(`done totalMs=${state.totalTimeMs}`);
}

function cmdError(phaseId) {
  const state = readState();
  if (!state || !state.feature) die('nessuna pipeline in corso.');
  const now = Date.now();
  closeCurrentPhase(state, now);
  if (phaseId) state.currentPhase = phaseId;
  state.status = 'error';
  state.updatedAt = new Date(now).toISOString();
  state.totalTimeMs = state.startedAt
    ? Math.max(0, now - Date.parse(state.startedAt))
    : null;
  writeState(state);
  log(`error phase=${state.currentPhase} totalMs=${state.totalTimeMs}`);
}

function cmdReset() {
  writeState(idleState());
  log('reset to idle');
}

function log(msg) {
  process.stdout.write(`[pipeline-state] ${msg}\n`);
}

function die(msg) {
  process.stderr.write(`[pipeline-state] ERROR: ${msg}\n`);
  process.exit(1);
}

const [, , cmd, arg] = process.argv;
switch (cmd) {
  case 'begin': cmdBegin(arg); break;
  case 'phase': cmdPhase(arg); break;
  case 'done':  cmdDone(); break;
  case 'error': cmdError(arg); break;
  case 'reset': cmdReset(); break;
  default:
    process.stdout.write(
      'Uso:\n' +
      '  node tools/pipeline-state.cjs begin <feature>\n' +
      '  node tools/pipeline-state.cjs phase <0|1-2|3|3.5|4|5|6|7|8|9>\n' +
      '  node tools/pipeline-state.cjs done\n' +
      '  node tools/pipeline-state.cjs error [phaseId]\n' +
      '  node tools/pipeline-state.cjs reset\n',
    );
    process.exit(cmd ? 1 : 0);
}
