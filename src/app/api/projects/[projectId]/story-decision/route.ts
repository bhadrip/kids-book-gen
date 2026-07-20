import { readAppConfig } from "@/lib/config/app-config";
import { createStoryWorkflow } from "@/lib/directions/create-story-workflow";
import { formRedirect } from "@/lib/http/form-response";

export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const fields = Object.fromEntries(await request.formData());
  const status =
    fields.status === "approved" ? "approved" : "revision_requested";
  const feedback =
    typeof fields.feedback === "string" ? fields.feedback : undefined;
  try {
    await (
      await createStoryWorkflow(readAppConfig(process.env), () => new Date())
    ).decideStory(projectId, status, feedback);
    return formRedirect(
      request,
      `/projects/${projectId}/story?decision=${status}`,
    );
  } catch {
    return formRedirect(
      request,
      `/projects/${projectId}/story?decision=failed`,
    );
  }
}
