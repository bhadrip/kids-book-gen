import { readAppConfig } from "@/lib/config/app-config";
import { formRedirect } from "@/lib/http/form-response";
import { createVisualNarrativeWorkflow } from "@/lib/visuals/create-visual-narrative-workflow";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    await (
      await createVisualNarrativeWorkflow(
        readAppConfig(process.env),
        () => new Date(),
      )
    ).generatePlan(projectId);
    return formRedirect(request, `/projects/${projectId}/look?result=plan`);
  } catch {
    return formRedirect(
      request,
      `/projects/${projectId}/look?result=plan_failed`,
    );
  }
}
