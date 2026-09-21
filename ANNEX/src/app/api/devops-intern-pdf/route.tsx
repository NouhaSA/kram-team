import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import {
  DevOpsInternPdf,
  registerDevOpsInternFonts,
} from "@/pdf/DevOpsInternPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dataUri(rel: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", ...rel.split("/"));
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET() {
  registerDevOpsInternFonts(
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Bold.ttf"),
  );

  const buffer = await renderToBuffer(
    <DevOpsInternPdf
      logoSrc={dataUri("brand/logo.png", "image/png")}
      heroSrc={dataUri("images/kb-sparring.jpg", "image/jpeg")}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Kram-Team-Cahier-Stage-DevOps.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
