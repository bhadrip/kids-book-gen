import { readAppConfig } from "@/lib/config/app-config";
import { formFailure, formRedirect } from "@/lib/http/form-response";
import { createBookProof } from "@/lib/proof/create-book-proof";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const fields = Object.fromEntries(await request.formData());
    await createBookProof(
      readAppConfig(process.env),
      () => new Date(),
    ).submitFeedback(projectId, {
      favoritePart: fields.favoritePart,
      confusion: fields.confusion,
      completion: fields.completion,
      ideaFidelityRating: fields.ideaFidelityRating,
      rereadInterest: fields.rereadInterest,
      sequelInterest: fields.sequelInterest,
    });
    return formRedirect(
      request,
      `/projects/${projectId}/book/read?result=feedback_saved#reading-feedback`,
    );
  } catch (error) {
    return formFailure(
      request,
      `/projects/${projectId}/book/read?result=feedback_failed#reading-feedback`,
      error instanceof Error
        ? error.message
        : "The feedback was not saved. The approved book remains unchanged.",
    );
  }
}
