import { NextResponse } from "next/server";
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
  const steering = String(fields.parentSteering ?? "").trim();
  if (!steering)
    return NextResponse.json(
      { message: "Tell us what should change." },
      { status: 400 },
    );
  try {
    await (
      await createStoryWorkflow(readAppConfig(process.env), () => new Date())
    ).reviseDirections(projectId, steering);
    return formRedirect(request, `/projects/${projectId}/directions`);
  } catch {
    return formRedirect(
      request,
      `/projects/${projectId}/directions?revision=failed`,
    );
  }
}
