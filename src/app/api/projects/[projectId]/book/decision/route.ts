import { readAppConfig } from "@/lib/config/app-config";
import { formFailure, formRedirect } from "@/lib/http/form-response";
import { createBookProduction } from "@/lib/production/create-book-production";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    await (
      await createBookProduction(readAppConfig(process.env), () => new Date())
    ).approveBook(projectId);
    return formRedirect(
      request,
      `/projects/${projectId}/book?result=book_approved#final-book-approval`,
    );
  } catch (error) {
    return formFailure(
      request,
      `/projects/${projectId}/book?result=failed#final-book-approval`,
      error instanceof Error
        ? error.message
        : "The complete book was not approved. Every page remains saved.",
    );
  }
}
