#!/usr/bin/env node
// kanon/tokens.json → dd-tokens.css, dd-tokens.js, flutter/dd_tokens.g.dart. Kullanım: node kanon/uret.mjs
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const kok = dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(readFileSync(join(kok, 'tokens.json'), 'utf8'));
const kebab = s => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const px = v => (typeof v === 'number' ? (v === 0 ? '0' : `${v}px`) : v);
const satir = [];
const v = (ad, deger) => satir.push(`  --dd-${ad}:${deger};`);
const bas = b => satir.push(`\n  /* ${b} */`);

// Renk
for (const grup of ['primary', 'neutral', 'accent', 'makro', 'durum']) {
  bas(`renk: ${grup}`);
  for (const [k, o] of Object.entries(T.color[grup])) v(kebab(k), o.value);
}

// Font
bas('font');
v('font', T.font.regular.stack);
v('font-bold', T.font.bold.stack);
v('font-light', T.font.light.stack);
v('weight-body', T.font.regular.weight);
v('weight-bold', T.font.bold.weight);

// Tipografi rolleri
v('lh-body', T.lineHeightBody);
bas('tipografi rolleri');
for (const [k, r] of Object.entries(T.typography)) {
  const a = kebab(k);
  v(`t-${a}-family`, `var(--dd-font${r.family === 'bold' ? '-bold' : ''})`);
  v(`t-${a}-size`, px(r.size));
  v(`t-${a}-weight`, r.weight);
  v(`t-${a}-line`, r.line);
  v(`t-${a}-track`, `${r.tracking}em`);
}

// Boşluk, radius, gölge
bas('boşluk');
for (const [k, x] of Object.entries(T.space)) v(`s-${k}`, px(x));
for (const [k, x] of Object.entries(T.spaceAlias)) v(kebab(k), px(x));
bas('radius');
for (const [k, x] of Object.entries(T.radius)) if (!k.startsWith('_')) v(`r-${kebab(k)}`, px(x));
bas('gölge');
for (const [k, x] of Object.entries(T.shadow)) v(`sh-${kebab(k)}`, x);

// Overlay: Gastro adları. Eğriler ekranda dd-kartlar.css (--dd-top-veil) ve DD.perde/DDCard.veils ile üretilir.
const O = T.overlay;
bas('overlay');
v('overlay', O.base);
v('floating-icon-bg', `color-mix(in srgb,var(--dd-overlay) ${O.floatingIconPercent}%,transparent)`);
v('sheet-scrim', `color-mix(in srgb,var(--dd-overlay) ${O.scrimPercent}%,transparent)`);
v('hero-light', `radial-gradient(ellipse at 0 0,color-mix(in srgb,var(--dd-primary) ${O.heroLight.alpha * 100}%,transparent) 0,transparent ${O.heroLight.end * 100}%)`);
v('header-solid', 'var(--dd-primary-dark)');

// Hareket
bas('hareket');
v('ease', T.motion.ease);
for (const [k, x] of Object.entries(T.motion)) if (typeof x === 'number') v(`m-${kebab(k)}`, `${x}ms`);
for (const [k, x] of Object.entries(T.motion.easing)) v(`e-${kebab(k)}`, x);
for (const [k, x] of Object.entries(T.motion.spring)) { v(`spring-${k}`, x.css); v(`spring-${k}-ms`, `${x.ms}ms`); }

// Ölçü, z
bas('ölçü');
for (const [k, x] of Object.entries(T.size)) v(`size-${kebab(k)}`, px(x));
bas('katman');
for (const [k, x] of Object.entries(T.z)) v(`z-${k}`, x);

// @font-face + çıktı
const face = (o, ad) => `@font-face{font-family:"${o.family}";src:url("../${o.file}") format("woff2");font-weight:${ad};font-style:normal;font-display:swap}`;
const css = `/* ÜRETİLİR: node kanon/uret.mjs — elle değiştirme. Kaynak: kanon/tokens.json */
${face(T.font.regular, '100 600')}
${face(T.font.bold, '700 900')}
${face({...T.font.bold, family: T.font.regular.family}, '700 900')}
${face(T.font.light, 300)}
:root{${satir.join('\n')}
}
`;
writeFileSync(join(kok, 'dd-tokens.css'), css);

// JS
const temiz = o => JSON.parse(JSON.stringify(o, (k, x) => (k.startsWith('_') || k === 'use' ? undefined : x)));
writeFileSync(join(kok, 'dd-tokens.js'), `/* ÜRETİLİR: node kanon/uret.mjs */\nwindow.DD_TOKENS=${JSON.stringify(temiz(T))};\n`);

// Flutter
const dart = ['// ÜRETİLİR: node kanon/uret.mjs. Kaynak: kanon/tokens.json', "import 'package:flutter/material.dart';", '', 'abstract final class DDColor {'];
const col = h => `Color(0xFF${h.slice(1)})`;
for (const grup of ['primary', 'neutral', 'accent', 'makro', 'durum']) for (const [k, o] of Object.entries(T.color[grup])) dart.push(`  static const ${k} = ${col(o.value)};`);
dart.push('}', '', 'abstract final class DDSpace {');
for (const [k, x] of Object.entries(T.space)) dart.push(`  static const double s${k} = ${x};`);
for (const [k, x] of Object.entries(T.spaceAlias)) dart.push(`  static const double ${k} = ${x};`);
dart.push('}', '', 'abstract final class DDRadius {');
for (const [k, x] of Object.entries(T.radius)) if (typeof x === 'number') dart.push(`  static const double ${k} = ${x};`);
dart.push('}', '', 'abstract final class DDSize {');
for (const [k, x] of Object.entries(T.size)) dart.push(`  static const double ${k} = ${x};`);
dart.push('}', '', 'abstract final class DDMotion {');
for (const [k, x] of Object.entries(T.motion)) if (typeof x === 'number') dart.push(`  static const ${k} = Duration(milliseconds: ${x});`);
for (const [k, x] of Object.entries(T.motion.sahne)) dart.push(`  static const sahne${k[0].toUpperCase()}${k.slice(1)} = ${x};`);
dart.push('}', '', 'abstract final class DDType {');
for (const [k, r] of Object.entries(T.typography)) dart.push(`  static const ${k} = TextStyle(fontFamily: '${T.font[r.family].family}', fontSize: ${r.size}, fontWeight: FontWeight.w${r.weight}, height: ${r.line}, letterSpacing: ${(r.tracking * r.size).toFixed(3)});`);
dart.push('}', '');
mkdirSync(join(kok, 'flutter'), {recursive: true});
writeFileSync(join(kok, 'flutter', 'dd_tokens.g.dart'), dart.join('\n'));
console.log('uretildi: dd-tokens.css, dd-tokens.js, flutter/dd_tokens.g.dart');
