/**
 * Usage: npx tsx scripts/generate-devops-phase1.ts
 */
import { renderToFile } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import React from "react";
import {
  DevOpsPhase1Pdf,
  registerDevOpsPhase1Fonts,
} from "../src/pdf/DevOpsPhase1Pdf";

function dataUri(rel: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", ...rel.split("/"));
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function main() {
  registerDevOpsPhase1Fonts(
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Bold.ttf"),
  );

  const filename = "Kram-Team-Mission-DevOps-Phase1.pdf";
  const out = path.join(process.cwd(), "public", filename);

  await renderToFile(
    React.createElement(DevOpsPhase1Pdf, {
      logoSrc: dataUri("brand/logo.png", "image/png"),
      heroSrc: dataUri("images/kb-sparring.jpg", "image/jpeg"),
    }),
    out,
  );

  fs.copyFileSync(out, path.join(process.cwd(), filename));
  fs.copyFileSync(out, path.join(process.cwd(), "..", filename));
  console.log("PDF généré :", out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
