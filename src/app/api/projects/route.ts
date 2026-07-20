import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { readAppConfig } from "@/lib/config/app-config";
import { formRedirect } from "@/lib/http/form-response";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { createProjectInputSchema } from "@/lib/projects/project";

export const runtime = "nodejs";

function repository() {
  const config = readAppConfig(process.env);
  return new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: randomUUID,
  });
}

export async function POST(request: Request) {
  try {
    const input = createProjectInputSchema.parse(
      request.headers.get("content-type")?.includes("application/json")
        ? await request.json()
        : Object.fromEntries(await request.formData()),
    );
    const project = await repository().create(input);

    return formRedirect(request, `/projects/${project.id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Enter a project title." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "We could not create this local project. Please try again." },
      { status: 500 },
    );
  }
}
