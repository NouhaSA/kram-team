import { renderToBuffer } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import {
  FranchiseOfferPdf,
  registerFranchisePdfFonts,
} from "@/pdf/FranchiseOfferPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dataUri(rel: string, mime: string) {
  const filePath = path.join(process.cwd(), "public", ...rel.split("/"));
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET() {
  registerFranchisePdfFonts(
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "SourceSans3-Bold.ttf"),
  );

  const buffer = await renderToBuffer(
    <FranchiseOfferPdf
      logoSrc={dataUri("brand/logo.png", "image/png")}
      images={{
        hero: dataUri("images/kb-hero.jpg", "image/jpeg"),
        coach: dataUri("images/kb-sparring.jpg", "image/jpeg"),
        sparring: dataUri("images/kb-ring.jpg", "image/jpeg"),
        training: dataUri("images/kb-punch.jpg", "image/jpeg"),
        pads: dataUri("images/kb-stance.jpg", "image/jpeg"),
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Offre-Franchise-Kram-Team.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
