import { readAppConfig } from "@/lib/config/app-config";
import { formFailure, formRedirect } from "@/lib/http/form-response";
import { BudgetConfirmationRequiredError } from "@/lib/production/book-production-service";
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
      `/projects/${projectId}/book?result=failed`,
      "Choose a page from the saved book.",
    );
  const pageId = parsedPageId.data;
  const fields = Object.fromEntries(await request.formData());
  const action = fields.action;
  try {
    const service = await createBookProduction(
      readAppConfig(process.env),
      () => new Date(),
    );
    if (action === "edit_text")
      await service.editPageText(
        projectId,
        pageId,
        typeof fields.text === "string" ? fields.text : "",
      );
    else if (action === "regenerate")
      await service.regeneratePage(
        projectId,
        pageId,
        typeof fields.feedback === "string" ? fields.feedback : "",
        typeof fields.preserve === "string" ? fields.preserve : "",
        fields.confirmOverFive === "on",
      );
    else throw new Error("Choose a supported page action.");
    return formRedirect(
      request,
      `/projects/${projectId}/book?result=${action}&page=${pageId}#${pageId}`,
    );
  } catch (error) {
    const message =
      error instanceof BudgetConfirmationRequiredError
        ? error.message
        : error instanceof Error
          ? error.message
          : "That page change did not finish. The current page and every sibling are still saved.";
    return formFailure(
      request,
      `/projects/${projectId}/book?result=failed&page=${pageId}#${pageId}`,
      message,
    );
  }
}
