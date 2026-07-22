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
  const optionId = typeof fields.optionId === "string" ? fields.optionId : "";
  try {
    await (
      await createVisualWorkflow(readAppConfig(process.env), () => new Date())
    ).selectCharacterAndGenerateSample(projectId, optionId);
    return formRedirect(request, `/projects/${projectId}/look?result=sample`);
  } catch {
    return formRedirect(request, `/projects/${projectId}/look?result=failed`);
  }
}
