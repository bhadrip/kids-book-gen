import { readAppConfig } from "@/lib/config/app-config";
import { createBookProof } from "@/lib/proof/create-book-proof";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const exported = await createBookProof(
      readAppConfig(process.env),
      () => new Date(),
    ).exportPdf(projectId);
    const responseBytes = new Uint8Array(exported.bytes.byteLength);
    responseBytes.set(exported.bytes);
    return new Response(responseBytes.buffer, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${exported.filename}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(
      error instanceof Error
        ? error.message
        : "The PDF was not exported. The approved book remains saved.",
      { status: 422 },
    );
  }
}
