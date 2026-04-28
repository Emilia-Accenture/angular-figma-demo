# 🎨 figma-screens/

In questa cartella vengono salvati gli **screenshot di riferimento** delle schermate Figma usate dalla pipeline.

## Quando usare questa cartella

- Quando Claude lancia `figma-screen-reader` (Phase 1), può salvare automaticamente uno screenshot del frame target qui, come `<feature>.png`.
- Utile come riferimento visivo se serve riprendere o controllare manualmente la generazione.

## Convenzioni

- Nome file: `<feature>.png` (kebab-case, lo stesso usato per la feature).
- Risoluzione: 1x del frame Figma originale.
- Niente file binari oltre PNG/JPG.

> Questo file è solo placeholder — la cartella sarà popolata automaticamente dall'agente.
