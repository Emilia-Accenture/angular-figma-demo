# `features/`

Cartella di destinazione per **tutte le feature generate dalla pipeline**.

Ogni feature segue la struttura:

```
features/<feature>/
├── <feature>.component.{ts,html,scss,spec.ts}    componente container
├── <feature>.service.ts                          service HttpClient tipizzato
├── <feature>.model.ts                            interfacce TypeScript
├── <feature>.constants.ts                        enum / opzioni / costanti
└── components/                                   sub-componenti opzionali
    └── <sub>/
        └── <sub>.component.{ts,html,scss,spec.ts}
```

Per generarne una nuova:

```
/figma-pipeline nome="<kebab-case>" figmaNode="<node-id>"
```

Vedi [`.claude/RUNBOOK.md`](../../../.claude/RUNBOOK.md) per il dettaglio operativo.
