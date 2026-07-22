import { readAppConfig } from "@/lib/config/app-config";
import { formFailure, formRedirect } from "@/lib/http/form-response";
import { createBookProduction } from "@/lib/production/create-book-production";
import { bookPageIdSchema } from "@/lib/production/production-artifacts";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string; pageId: string }> },
) {
  const { projectId, pageId: rawPageId } = await params;
  const parsedPageId = bookPageIdSchema.safeParse(rawPageId);
  if (!parsedPageId.success)
    return formFailure(
      request,
      `/projects/${projectId}/book?result=plan_failed`,
      "Choose a page from the current book plan.",
    );
  const fields = Object.fromEntries(await request.formData());
  const text = typeof fields.text === "string" ? fields.text : "";
  const illustrationDescription =
    typeof fields.illustrationDescription === "string"
      ? fields.illustrationDescription
      : "";
  const requiredReferenceDetails =
    typeof fields.requiredReferenceDetails === "string"
      ? fields.requiredReferenceDetails
          .split("\n")
          .map((detail) => detail.trim())
          .filter(Boolean)
      : [];
  try {
    await (
      await createBookProduction(readAppConfig(process.env), () => new Date())
    ).editBookPlanPage(projectId, parsedPageId.data, {
      text,
      illustrationDescription,
      requiredReferenceDetails,
    });
    return formRedirect(
      request,
      `/projects/${projectId}/book?result=plan_saved&page=${parsedPageId.data}#plan-${parsedPageId.data}`,
    );
  } catch (error) {
    return formFailure(
      request,
      `/projects/${projectId}/book?result=plan_failed&page=${parsedPageId.data}`,
      error instanceof Error
        ? error.message
        : "That plan change was not saved. The approved story and visual sample remain unchanged.",
    );
  }
}
