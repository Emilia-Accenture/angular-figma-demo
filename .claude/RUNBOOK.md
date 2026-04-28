# Runbook

## Prerequisiti

- Node 18+, npm 9+.
- Tool MCP Figma configurato (`figma/get_design_context`, `figma/get_screenshot`, ...).

## Avvio dev

```
npm install
npm run dev    # avvia api (4201) + ng serve (4200)
```

## Lanciare la pipeline

```
/figma-pipeline nome="<kebab>" figmaNode="<node-id>"
```

Senza `figmaNode`, la pipeline usa lo screenshot allegato come fallback.

## Riprendere da checkpoint

```
/figma-pipeline resume=true nome="<kebab>"
```

## Eliminare una feature

Bottone "Elimina componente" nella home, oppure `DELETE /api/feature/:name`. Rimuove cartella feature, output `<nome>_*`, marker block in `_tokens.scss` e `dev-api.cjs`, e azzera `pipeline-state.json`.

## Stato visuale pipeline

L'orchestratore deve **sempre** chiamare `tools/pipeline-state.cjs` a ogni cambio fase (mai scrittura manuale del JSON):

```
node tools/pipeline-state.cjs begin <nome>
node tools/pipeline-state.cjs phase <id>   # a ogni transizione
node tools/pipeline-state.cjs done          # a fine pipeline
```

Senza chiamate a ogni fase, la casella illuminata si blocca e poi salta in avanti. Senza `Date.now()` reale, i tempi totali risultano sballati.

## Troubleshooting rapido

| Sintomo | Azione |
|---------|--------|
| Phase 7 fallisce > 5 retry | leggere `output/temp/<nome>_07_runtime_report.md`, fix manuale |
| `@` letterale rotto in template | sostituire con `&#64;` |
| Token non risolto in SCSS | verificare marker block in `_tokens.scss` |
| Preview mostra "componente non trovato" | controllare che `<nome>.component.ts` esporti la classe `…Component` |
| Casella home si blocca / tempi sballati | l'orchestratore non sta chiamando `tools/pipeline-state.cjs phase` a ogni transizione |
