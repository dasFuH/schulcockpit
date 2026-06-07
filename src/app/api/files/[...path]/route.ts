/**
 * Geschützte Auslieferung hochgeladener Dateien.
 * Nur eingeloggte Nutzer dürfen Anhänge sehen. Verhindert Path-Traversal,
 * indem der aufgelöste Pfad innerhalb des UPLOAD_DIR liegen muss.
 */
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { uploadVerzeichnis } from "@/lib/upload";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Nicht angemeldet", { status: 401 });
  }

  const { path: segments } = await params;
  const basis = uploadVerzeichnis();
  const zielPfad = path.resolve(basis, ...segments);

  // Schutz vor Path-Traversal: Ziel muss im Upload-Verzeichnis liegen.
  if (!zielPfad.startsWith(path.resolve(basis))) {
    return new NextResponse("Ungültiger Pfad", { status: 400 });
  }

  try {
    const datei = await readFile(zielPfad);
    const typ = mimeAusEndung(zielPfad);
    return new NextResponse(new Uint8Array(datei), {
      headers: {
        "Content-Type": typ,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Datei nicht gefunden", { status: 404 });
  }
}

function mimeAusEndung(p: string): string {
  const ext = path.extname(p).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
      return "image/heic";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
