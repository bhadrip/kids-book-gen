import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";

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
  { params }: { params: Promise<{ projectId: string; filename: string }> },
) {
  const { projectId, filename } = await params;
  const repository = new FileProjectRepository(
    readAppConfig(process.env).projectRoot,
    { now: () => new Date(), createId: () => crypto.randomUUID() },
  );
  try {
    const bytes = await repository.readAsset(projectId, filename);
    const extension = filename.split(".").at(-1)?.toLowerCase() ?? "";
    const contentType = contentTypes[extension];
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
