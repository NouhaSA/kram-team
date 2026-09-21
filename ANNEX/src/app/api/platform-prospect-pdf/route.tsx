import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import {
  PlatformProspectPdf,
  registerPlatformProspectFonts,
} from "@/pdf/PlatformProspectPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dataUri(rel: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", ...rel.split("/"));
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET() {
  registerPlatformProspectFonts(
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Bold.ttf"),
  );

  const buffer = await renderToBuffer(
    <PlatformProspectPdf
      logoSrc={dataUri("brand/logo.png", "image/png")}
      heroSrc={dataUri("images/kb-hero.jpg", "image/jpeg")}
      secondarySrc={dataUri("images/kb-ring.jpg", "image/jpeg")}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Kram-Team-Plateforme-Dossier-Prospection.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
