import { readAppConfig } from "@/lib/config/app-config";
import { formRedirect } from "@/lib/http/form-response";
import { createVisualWorkflow } from "@/lib/visuals/create-visual-workflow";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const fields = Object.fromEntries(await request.formData());
  const status = fields.status === "approved" ? "approved" : "change_requested";
  const feedback =
    typeof fields.feedback === "string" ? fields.feedback : undefined;
  try {
    await (
      await createVisualWorkflow(readAppConfig(process.env), () => new Date())
    ).decideVisual(projectId, status, feedback);
    return formRedirect(
      request,
      `/projects/${projectId}/look?result=${status}`,
    );
  } catch {
    return formRedirect(request, `/projects/${projectId}/look?result=failed`);
  }
}
