# Dada Diet Mobile

Static HTML prototype of the Dada Diet mobile app (iOS and Android, Flutter later). No build step.

- `index.html`: the app (single page, hash router)
- `kanon/`: design tokens, component library, gallery at `/kanon/`
- `ekranlar/`: one file per screen, built only from the canon
- `veri/`: sample data
- `assets/`: fonts, icons, brand files, images

Regenerate tokens: `node kanon/uret.mjs`
