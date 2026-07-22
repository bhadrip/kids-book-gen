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
    ).approveBookPlan(projectId);
    return formRedirect(
      request,
      `/projects/${projectId}/book?result=plan_approved#production-estimate`,
    );
  } catch (error) {
    return formFailure(
      request,
      `/projects/${projectId}/book?result=plan_failed`,
      error instanceof Error
        ? error.message
        : "The book plan was not approved. The story and visual sample remain safe.",
    );
  }
}
