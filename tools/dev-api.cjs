#!/usr/bin/env node
// ============================================================
// Dev API — angular-figma-demo
// ------------------------------------------------------------
// Mini server HTTP (zero dipendenze) usato dalla home page in
// dev mode per:
//   - DELETE /api/feature/:name             → rimuove src/app/features/<name>,
//                                             cancella i file output/<name>_*
//                                             (e in output/temp/), strippa
//                                             i blocchi marcati `// === BEGIN
//                                             feature:<name> === ... // === END
//                                             feature:<name> ===` da
//                                             tools/dev-api.cjs e
//                                             src/styles/_tokens.scss,
//                                             azzera output/pipeline-state.json
//   - POST   /api/pipeline-state            → scrive output/pipeline-state.json
//   - GET    /api/health                    → ping
//
// Mock backend per le feature generate dalla pipeline:
// ogni feature aggiunge i propri endpoint dentro un blocco marcato
//   `// === BEGIN feature:<nome> === ... // === END feature:<nome> ===`
// che viene rimosso automaticamente alla DELETE della feature.
//
// Usato tramite proxy.conf.json (Angular dev server → 4201).
// Avviato in watch (`node --watch`) da `npm run api`: ogni modifica al
// file ricarica il processo automaticamente.
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DEV_API_PORT ? Number(process.env.DEV_API_PORT) : 4201;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FEATURES_DIR = path.join(PROJECT_ROOT, 'src', 'app', 'features');
const STATE_FILE = path.join(PROJECT_ROOT, 'output', 'pipeline-state.json');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'output');
const TEMP_DIR = path.join(OUTPUT_DIR, 'temp');
const TOKENS_FILE = path.join(PROJECT_ROOT, 'src', 'styles', '_tokens.scss');
const SELF_FILE = __filename;

const FEATURE_NAME_RE = /^[a-z0-9][a-z0-9-]*$/;
const PROTECTED_FEATURES = new Set(['_placeholder']);

// ============================================================
// Mock backend per feature generate dalla pipeline.
// Le sezioni marcate `=== BEGIN/END feature:<nome> ===` sono
// rimosse automaticamente quando la feature viene eliminata.
// ============================================================


function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function writeStateFile(state) {
  const payload = {
    feature: state.feature ?? null,
    currentPhase: state.currentPhase ?? null,
    status: state.status ?? 'idle',
    updatedAt: state.updatedAt ?? new Date().toISOString(),
    startedAt: state.startedAt ?? null,
    phaseTimes: state.phaseTimes ?? {},
    totalTimeMs: state.totalTimeMs ?? null,
  };
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return payload;
}

// Rimuove dal file `filePath` tutte le occorrenze del blocco
//   // === BEGIN feature:<name> === ... // === END feature:<name> ===
// (compatibile sia con SCSS sia con JS, entrambi supportano i `//` comments).
function stripFeatureBlocks(filePath, name) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `[ \\t]*//[ \\t]*=== BEGIN feature:${escapedName} ===[\\s\\S]*?//[ \\t]*=== END feature:${escapedName} ===[ \\t]*\\r?\\n?`,
    'g',
  );
  const cleaned = content.replace(re, '');
  if (cleaned === content) return false;
  fs.writeFileSync(filePath, cleaned, 'utf8');
  return true;
}

// Cancella i file in output/ e output/temp/ che iniziano con `<name>_`.
function deleteOutputArtifacts(name) {
  const removed = [];
  const dirs = [OUTPUT_DIR, TEMP_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith(`${name}_`)) {
        const full = path.join(dir, f);
        try {
          fs.rmSync(full, { recursive: true, force: true });
          removed.push(path.relative(PROJECT_ROOT, full).replace(/\\/g, '/'));
        } catch {
          /* ignore */
        }
      }
    }
  }
  return removed;
}

function deleteFeature(name) {
  if (!FEATURE_NAME_RE.test(name)) {
    return { ok: false, status: 400, error: `Nome feature non valido: "${name}"` };
  }
  if (PROTECTED_FEATURES.has(name)) {
    return { ok: false, status: 400, error: `Feature "${name}" è protetta.` };
  }
  const target = path.join(FEATURES_DIR, name);
  const resolved = path.resolve(target);
  if (!resolved.startsWith(path.resolve(FEATURES_DIR) + path.sep)) {
    return { ok: false, status: 400, error: 'Path fuori da src/app/features.' };
  }
  const folderExisted = fs.existsSync(resolved);
  if (folderExisted) {
    fs.rmSync(resolved, { recursive: true, force: true });
  }

  const outputRemoved = deleteOutputArtifacts(name);
  const tokensStripped = stripFeatureBlocks(TOKENS_FILE, name);
  const selfStripped = stripFeatureBlocks(SELF_FILE, name);

  if (!folderExisted && outputRemoved.length === 0 && !tokensStripped && !selfStripped) {
    return { ok: false, status: 404, error: `Feature "${name}" non trovata.` };
  }

  return {
    ok: true,
    deleted: {
      folder: folderExisted ? path.relative(PROJECT_ROOT, resolved).replace(/\\/g, '/') : null,
      outputFiles: outputRemoved,
      tokensStripped,
      devApiStripped: selfStripped,
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return send(res, 200, { ok: true, port: PORT, projectRoot: PROJECT_ROOT });
  }

  const deleteMatch = url.pathname.match(/^\/api\/feature\/([^/]+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const name = decodeURIComponent(deleteMatch[1]);
    const result = deleteFeature(name);
    if (!result.ok) {
      return send(res, result.status, { ok: false, error: result.error });
    }
    const state = writeStateFile({ status: 'idle', currentPhase: null, feature: null });
    return send(res, 200, { ok: true, deleted: result.deleted, state });
  }

  if (req.method === 'POST' && url.pathname === '/api/pipeline-state') {
    try {
      const body = await readJsonBody(req);
      const state = writeStateFile(body);
      return send(res, 200, { ok: true, state });
    } catch (err) {
      return send(res, 400, { ok: false, error: `Body non valido: ${err.message}` });
    }
  }


  return send(res, 404, { ok: false, error: 'Endpoint non trovato.' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`[dev-api] features dir: ${FEATURES_DIR}`);
});
