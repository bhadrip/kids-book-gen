import { readAppConfig } from "@/lib/config/app-config";
import { formRedirect } from "@/lib/http/form-response";
import { artPresetIdSchema } from "@/lib/visuals/art-presets";
import { createVisualWorkflow } from "@/lib/visuals/create-visual-workflow";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const fields = Object.fromEntries(await request.formData());
  try {
    const presetId = artPresetIdSchema.parse(fields.presetId);
    await (
      await createVisualWorkflow(readAppConfig(process.env), () => new Date())
    ).generateCharacterDesigns(projectId, presetId);
    return formRedirect(request, `/projects/${projectId}/look?result=designs`);
  } catch {
    return formRedirect(request, `/projects/${projectId}/look?result=failed`);
  }
}
