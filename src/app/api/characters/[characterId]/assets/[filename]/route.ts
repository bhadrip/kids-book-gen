import { readAppConfig } from "@/lib/config/app-config";
import { FileCharacterLibraryRepository } from "@/lib/characters/file-character-library-repository";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  svg: "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterId: string; filename: string }> },
) {
  const { characterId, filename } = await params;
  const repository = new FileCharacterLibraryRepository(
    readAppConfig(process.env).characterLibraryRoot,
  );
  try {
    const bytes = await repository.readAsset(characterId, filename);
    const contentType =
      contentTypes[filename.split(".").at(-1)?.toLowerCase() ?? ""];
    if (!contentType) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
