import { readAppConfig } from "@/lib/config/app-config";
import { formFailure, formRedirect } from "@/lib/http/form-response";
import { BudgetConfirmationRequiredError } from "@/lib/production/book-production-service";
import { createBookProduction } from "@/lib/production/create-book-production";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const fields = Object.fromEntries(await request.formData());
  const action = fields.action === "pause" ? "pause" : "start";
  try {
    const service = await createBookProduction(
      readAppConfig(process.env),
      () => new Date(),
    );
    if (action === "pause") {
      await service.pause(projectId);
      return formRedirect(request, `/projects/${projectId}/book?result=paused`);
    }
    await service.startOrResume(projectId, fields.confirmOverFive === "on");
    return formRedirect(request, `/projects/${projectId}/book?result=saved`);
  } catch (error) {
    const message =
      error instanceof BudgetConfirmationRequiredError
        ? error.message
        : "Book production did not finish. Every completed page is still saved; resume with the next missing page.";
    return formFailure(
      request,
      `/projects/${projectId}/book?result=failed`,
      message,
    );
  }
}
