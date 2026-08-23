import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { readAppConfig } from "@/lib/config/app-config";
import { createStoryWorkflow } from "@/lib/directions/create-story-workflow";
import { formRedirect } from "@/lib/http/form-response";
import { projectBriefSchema, storyMoodSchema } from "@/lib/projects/project";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const config = readAppConfig(process.env);
  try {
    const now = () => new Date();
    const fields = Object.fromEntries(await request.formData());
    const storyMood = storyMoodSchema.parse(fields.storyMood);
    if (
      storyMood === "something_else" &&
      (typeof fields.customStoryMood !== "string" ||
        !fields.customStoryMood.trim())
    )
      return NextResponse.json(
        { message: "Describe the mood you want for this story." },
        { status: 400 },
      );
    const brief = projectBriefSchema.parse({
      ...fields,
      storyMood,
      readerConfiguration: {
        age: fields.readerAge,
        readingMode: fields.readingMode,
        profileVersion: "reader-profiles-v1",
      },
      schemaVersion: 1,
      projectId,
      createdAt: now().toISOString(),
    });
    await (await createStoryWorkflow(config, now)).createDirections(brief);
    return formRedirect(request, `/projects/${projectId}/directions`);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Check the story details." },
        { status: 400 },
      );
    }
    return formRedirect(
      request,
      `/projects/${projectId}/idea?generation=failed`,
    );
  }
}
