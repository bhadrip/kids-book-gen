import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { readAppConfig } from "@/lib/config/app-config";
import { createStoryWorkflow } from "@/lib/directions/create-story-workflow";
import { formRedirect } from "@/lib/http/form-response";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const config = readAppConfig(process.env);
    const fields = Object.fromEntries(await request.formData());
    await (
      await createStoryWorkflow(config, () => new Date())
    ).selectDirection(
      projectId,
      String(fields.directionTitle ?? ""),
      typeof fields.parentFeedback === "string"
        ? fields.parentFeedback
        : undefined,
    );
    return formRedirect(request, `/projects/${projectId}/story`);
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Choose a direction." },
        { status: 400 },
      );
    return formRedirect(
      request,
      `/projects/${projectId}/directions?story=failed`,
    );
  }
}
