#!/usr/bin/env node
// Génère icône + splash (phase 6 du build) et compose les screenshots App Store aux tailles Apple
// exactes, par langue (phase /app-store). Voir skill .claude/skills/assets/SKILL.md.
//
// Usage :
//   node scripts/generate-assets.mjs --icon <source.png> --out assets/
//   node scripts/generate-assets.mjs --screenshots --input captures/ --out store-assets/ --lang fr,en
//
// Nécessite le package `sharp` (traitement d'image). Si absent : `npm install sharp` avant usage.

import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const ICON_SIZES = [1024, 180, 120, 87, 80, 60, 58, 40, 29, 20];
const APPLE_SCREENSHOT_SIZES = {
  "6.7": { width: 1290, height: 2796 }, // iPhone 15/14 Pro Max et équivalents
  "6.5": { width: 1284, height: 2778 },
  "5.5": { width: 1242, height: 2208 },
};

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error(
      "Le package `sharp` n'est pas installé. Lance `npm install sharp` puis relance ce script.",
    );
    process.exit(1);
  }
}

async function generateIcon(sourcePath, outDir) {
  const sharp = await loadSharp();
  await mkdir(outDir, { recursive: true });
  for (const size of ICON_SIZES) {
    const out = path.join(outDir, `icon-${size}.png`);
    await sharp(sourcePath).resize(size, size, { fit: "cover" }).png().toFile(out);
    console.log(`✅ icône ${size}x${size} → ${out}`);
  }
  // Splash : fond uni + icône centrée, 1284x2778 par défaut (recadré par Expo selon l'appareil)
  const splashOut = path.join(outDir, "splash.png");
  const icon512 = await sharp(sourcePath).resize(512, 512, { fit: "cover" }).toBuffer();
  await sharp({
    create: { width: 1284, height: 2778, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: icon512, gravity: "center" }])
    .png()
    .toFile(splashOut);
  console.log(`✅ splash → ${splashOut}`);
}

async function generateScreenshots(inputDir, outDir, langs) {
  const sharp = await loadSharp();
  const files = (await readdir(inputDir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (files.length === 0) {
    console.error(
      `Aucune capture trouvée dans ${inputDir}. Prends de vraies captures du build réel (TestFlight ou ` +
        `Expo Go) avant de composer — jamais un mockup fictif (voir skill assets).`,
    );
    process.exit(1);
  }

  for (const lang of langs) {
    const langOutDir = path.join(outDir, lang);
    await mkdir(langOutDir, { recursive: true });
    for (const [deviceClass, size] of Object.entries(APPLE_SCREENSHOT_SIZES)) {
      for (const file of files) {
        const src = path.join(inputDir, file);
        const out = path.join(langOutDir, `${deviceClass}-${file}`);
        await sharp(src)
          .resize(size.width, size.height, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .png()
          .toFile(out);
        console.log(`✅ ${deviceClass}" (${lang}) ← ${file} → ${out}`);
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  if (args.includes("--screenshots")) {
    const input = get("--input") ?? "captures";
    const out = get("--out") ?? "store-assets";
    const langs = (get("--lang") ?? "fr,en").split(",");
    await generateScreenshots(input, out, langs);
    return;
  }

  const icon = get("--icon");
  const out = get("--out") ?? "assets";
  if (!icon) {
    console.error("Usage: node scripts/generate-assets.mjs --icon <source.png> --out <dossier>");
    process.exit(1);
  }
  await generateIcon(icon, out);
}

main().catch((err) => {
  console.error(`Erreur génération assets : ${err.message}`);
  process.exit(1);
});
