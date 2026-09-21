/**
 * Génère le PDF prospection dans public/
 * Usage: npx tsx scripts/generate-platform-prospect.ts
 */
import { renderToFile } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import React from "react";
import {
  PlatformProspectPdf,
  registerPlatformProspectFonts,
} from "../src/pdf/PlatformProspectPdf";

function dataUri(rel: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", ...rel.split("/"));
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function main() {
  registerPlatformProspectFonts(
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Bold.ttf"),
  );

  const out = path.join(
    process.cwd(),
    "public",
    "Kram-Team-Plateforme-Dossier-Prospection.pdf",
  );

  await renderToFile(
    React.createElement(PlatformProspectPdf, {
      logoSrc: dataUri("brand/logo.png", "image/png"),
      heroSrc: dataUri("images/kb-hero.jpg", "image/jpeg"),
      secondarySrc: dataUri("images/kb-ring.jpg", "image/jpeg"),
    }),
    out,
  );

  // Copie aussi à la racine ANNEX pour accès facile
  const rootCopy = path.join(
    process.cwd(),
    "Kram-Team-Plateforme-Dossier-Prospection.pdf",
  );
  fs.copyFileSync(out, rootCopy);

  console.log("PDF généré :");
  console.log(" -", out);
  console.log(" -", rootCopy);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
