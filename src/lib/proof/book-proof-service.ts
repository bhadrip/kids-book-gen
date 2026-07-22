import type { BookLayoutPage } from "@/components/book-spread";
import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { renderBookHtml } from "@/lib/proof/book-html";
import type { PdfRenderer } from "@/lib/proof/pdf-renderer";
import {
  bookProofSchema,
  pilotSummarySchema,
  readingFeedbackInputSchema,
  readingFeedbackSchema,
  type BookProof,
  type PilotSummary,
  type ReadingFeedback,
} from "@/lib/proof/proof-artifacts";
import {
  requiredBookPageIds,
  runBookPreflight,
} from "@/lib/production/book-preflight";
import {
  bookDecisionSchema,
  bookPageSchema,
  bookPlanSchema,
  bookProductionJobSchema,
  type BookDecision,
  type BookPage,
  type BookPlan,
  type BookProductionJob,
} from "@/lib/production/production-artifacts";

async function optional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

function mimeTypeFor(filename: string): string {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  throw new Error("A saved page uses an unsupported image format.");
}

export class ProofLayoutError extends Error {
  public constructor(public readonly pageIds: string[]) {
    super(
      `The PDF was not exported because text overflows on ${pageIds.join(", ")}. Edit those text layers and approve the updated book before trying again.`,
    );
  }
}

type ApprovedBook = {
  decision: BookDecision;
  pages: BookPage[];
  plan: BookPlan;
};

export class BookProofService {
  public constructor(
    private readonly repository: FileProjectRepository,
    private readonly renderer: PdfRenderer,
    private readonly now: () => Date,
  ) {}

  public async prepareReader(projectId: string): Promise<{
    proof: BookProof;
    pages: BookLayoutPage[];
    feedback: ReadingFeedback | null;
    summary: PilotSummary | null;
  }> {
    const approved = await this.loadApprovedBook(projectId);
    const existing = await optional(
      this.repository.readArtifact(
        projectId,
        "book-proof.json",
        bookProofSchema,
      ),
    );
    const pages = await this.createLayoutPages(projectId, approved);
    if (existing && this.proofMatches(existing, approved.decision)) {
      const [feedback, summary] = await this.loadFeedbackAndSummary(projectId);
      return {
        proof: existing,
        pages,
        feedback:
          feedback?.sourceProofRevision === existing.revision ? feedback : null,
        summary:
          feedback?.sourceProofRevision === existing.revision ? summary : null,
      };
    }

    const revision = (existing?.revision ?? 0) + 1;
    const createdAt = this.now().toISOString();
    const htmlFilename = `proof-r${String(revision).padStart(2, "0")}.html`;
    const html = renderBookHtml(
      (await this.repository.load(projectId)).title,
      pages,
    );
    const proof = bookProofSchema.parse({
      schemaVersion: 1,
      projectId,
      revision,
      sourceBookDecisionRevision: approved.decision.decisionRevision,
      pageRevisions: approved.decision.pageRevisions,
      status: "ready",
      layoutStatus: "not_checked",
      layoutIssuePageIds: [],
      htmlFilename,
      createdAt,
    });
    await Promise.all([
      this.repository.writeAsset(projectId, htmlFilename, Buffer.from(html)),
      this.repository.writeAsset(projectId, "proof.html", Buffer.from(html)),
      this.saveProof(projectId, proof),
    ]);
    return { proof, pages, feedback: null, summary: null };
  }

  public async exportPdf(projectId: string): Promise<{
    bytes: Uint8Array;
    filename: string;
    proof: BookProof;
  }> {
    const reader = await this.prepareReader(projectId);
    if (reader.proof.status === "exported" && reader.proof.pdfFilename) {
      const savedBytes = await optional(
        this.repository.readAsset(projectId, reader.proof.pdfFilename),
      );
      if (savedBytes && savedBytes.subarray(0, 4).equals(Buffer.from("%PDF")))
        return {
          bytes: new Uint8Array(savedBytes),
          filename: reader.proof.pdfFilename,
          proof: reader.proof,
        };
    }
    let html = await optional(
      this.repository.readAsset(projectId, reader.proof.htmlFilename),
    );
    if (!html) {
      html = Buffer.from(
        renderBookHtml(
          (await this.repository.load(projectId)).title,
          reader.pages,
        ),
      );
      await Promise.all([
        this.repository.writeAsset(projectId, reader.proof.htmlFilename, html),
        this.repository.writeAsset(projectId, "proof.html", html),
      ]);
    }
    let result: Awaited<ReturnType<PdfRenderer["render"]>>;
    try {
      result = await this.renderer.render(html.toString("utf8"));
    } catch {
      throw new Error(
        "The local PDF renderer did not finish. Your approved pages and any prior proof remain saved. Run `just setup` to repair the local browser, then try again.",
      );
    }
    if (result.renderedPageCount !== requiredBookPageIds.length)
      throw new Error(
        `The PDF renderer found ${result.renderedPageCount} pages instead of 16. No PDF was saved.`,
      );
    if (result.overflowPageIds.length > 0) {
      const failed = bookProofSchema.parse({
        ...reader.proof,
        layoutStatus: "failed",
        layoutIssuePageIds: result.overflowPageIds,
      });
      await this.saveProof(projectId, failed);
      throw new ProofLayoutError(result.overflowPageIds);
    }
    if (!Buffer.from(result.bytes).subarray(0, 4).equals(Buffer.from("%PDF")))
      throw new Error(
        "The PDF renderer returned an invalid file. No PDF was saved.",
      );

    const filename = `proof-r${String(reader.proof.revision).padStart(2, "0")}.pdf`;
    const exportedAt = this.now().toISOString();
    const proof = bookProofSchema.parse({
      ...reader.proof,
      status: "exported",
      layoutStatus: "passed",
      layoutIssuePageIds: [],
      pdfFilename: filename,
      exportedAt,
    });
    await Promise.all([
      this.repository.writeAsset(projectId, filename, result.bytes),
      this.repository.writeAsset(projectId, "proof.pdf", result.bytes),
      this.saveProof(projectId, proof),
    ]);
    await this.recordActivity(
      projectId,
      "proof_exported",
      "A screen-quality PDF was exported from all 16 approved page revisions.",
    );
    return { bytes: result.bytes, filename, proof };
  }

  public async submitFeedback(
    projectId: string,
    input: unknown,
  ): Promise<{ feedback: ReadingFeedback; summary: PilotSummary }> {
    const parsed = readingFeedbackInputSchema.parse(input);
    const reader = await this.prepareReader(projectId);
    const current = await optional(
      this.repository.readArtifact(
        projectId,
        "feedback.json",
        readingFeedbackSchema,
      ),
    );
    const submittedAt = this.now().toISOString();
    const feedback = readingFeedbackSchema.parse({
      schemaVersion: 1,
      projectId,
      revision: (current?.revision ?? 0) + 1,
      sourceProofRevision: reader.proof.revision,
      ...parsed,
      submittedAt,
    });
    const project = await this.repository.load(projectId);
    const job = await this.loadJob(projectId);
    const summary = pilotSummarySchema.parse({
      schemaVersion: 1,
      projectId,
      sourceFeedbackRevision: feedback.revision,
      calculatedAt: submittedAt,
      minutesFromProjectStartToFeedback: Math.max(
        0,
        Math.round(
          (new Date(submittedAt).getTime() -
            new Date(project.createdAt).getTime()) /
            60_000,
        ),
      ),
      finalPageRegenerationCount: job.activity.filter(
        (event) => event.type === "regenerated",
      ).length,
      estimatedBookCostUsd: job.estimatedSpentCostUsd,
      ideaFidelityRating: feedback.ideaFidelityRating,
      readingCompleted: feedback.completion === "finished",
      rereadInterest: feedback.rereadInterest,
      sequelInterest: feedback.sequelInterest,
    });
    await Promise.all([
      this.repository.writeArtifact(
        projectId,
        `feedback-r${String(feedback.revision).padStart(2, "0")}.json`,
        feedback,
      ),
      this.repository.writeArtifact(projectId, "feedback.json", feedback),
      this.repository.writeArtifact(projectId, "pilot-summary.json", summary),
    ]);
    await this.recordActivity(
      projectId,
      "feedback_saved",
      `Reading feedback revision ${feedback.revision} was saved locally; it does not change this book or train a model.`,
    );
    return { feedback, summary };
  }

  private async loadApprovedBook(projectId: string): Promise<ApprovedBook> {
    let decision: BookDecision;
    let pages: BookPage[];
    let plan: BookPlan;
    try {
      [decision, pages, plan] = await Promise.all([
        this.repository.readArtifact(
          projectId,
          "book-decision.json",
          bookDecisionSchema,
        ),
        Promise.all(
          requiredBookPageIds.map((pageId) =>
            this.repository.readArtifact(
              projectId,
              `book-page-${pageId}.json`,
              bookPageSchema,
            ),
          ),
        ),
        this.loadPlan(projectId),
      ]);
    } catch {
      throw new Error(
        "Finish all 16 pages, pass production preflight, and approve the complete book before opening the reader.",
      );
    }
    const preflight = runBookPreflight({
      projectId,
      checkedAt: this.now().toISOString(),
      pages,
    });
    if (preflight.status !== "passed")
      throw new Error(
        "The reader stays locked until all 16 pages pass production preflight.",
      );
    const exactRevisions = requiredBookPageIds.every((pageId) => {
      const page = pages.find((candidate) => candidate.pageId === pageId);
      const approved = decision.pageRevisions.find(
        (candidate) => candidate.pageId === pageId,
      );
      return page && approved?.revision === page.revision;
    });
    if (!exactRevisions)
      throw new Error(
        "A page changed after the last complete-book approval. Approve the current book before opening the reader or exporting a PDF.",
      );
    return { decision, pages, plan };
  }

  private loadPlan(projectId: string) {
    return this.repository.readArtifact(
      projectId,
      "book-plan.json",
      bookPlanSchema,
    );
  }

  private async createLayoutPages(
    projectId: string,
    approved: ApprovedBook,
  ): Promise<BookLayoutPage[]> {
    return Promise.all(
      approved.pages.map(async (page) => {
        const planPage = approved.plan.pages.find(
          (candidate) => candidate.pageId === page.pageId,
        );
        if (!planPage)
          throw new Error(`The approved plan is missing ${page.pageId}.`);
        const bytes = await this.repository.readAsset(
          projectId,
          page.assetFilename,
        );
        return {
          pageId: page.pageId,
          sequence: page.sequence,
          title: page.title,
          text: page.text,
          altText: page.altText,
          imageUrl: `data:${mimeTypeFor(page.assetFilename)};base64,${bytes.toString("base64")}`,
          textSafeArea: planPage.textSafeArea,
        };
      }),
    );
  }

  private proofMatches(proof: BookProof, decision: BookDecision): boolean {
    return (
      proof.sourceBookDecisionRevision === decision.decisionRevision &&
      decision.pageRevisions.every((approved) =>
        proof.pageRevisions.some(
          (page) =>
            page.pageId === approved.pageId &&
            page.revision === approved.revision,
        ),
      )
    );
  }

  private async saveProof(projectId: string, proof: BookProof): Promise<void> {
    await Promise.all([
      this.repository.writeArtifact(
        projectId,
        `book-proof-r${String(proof.revision).padStart(2, "0")}.json`,
        proof,
      ),
      this.repository.writeArtifact(projectId, "book-proof.json", proof),
    ]);
  }

  private async loadFeedbackAndSummary(
    projectId: string,
  ): Promise<[ReadingFeedback | null, PilotSummary | null]> {
    return Promise.all([
      optional(
        this.repository.readArtifact(
          projectId,
          "feedback.json",
          readingFeedbackSchema,
        ),
      ),
      optional(
        this.repository.readArtifact(
          projectId,
          "pilot-summary.json",
          pilotSummarySchema,
        ),
      ),
    ]);
  }

  private async loadJob(projectId: string): Promise<BookProductionJob> {
    return this.repository.readArtifact(
      projectId,
      "book-production-job.json",
      bookProductionJobSchema,
    );
  }

  private async recordActivity(
    projectId: string,
    type: "proof_exported" | "feedback_saved",
    message: string,
  ): Promise<void> {
    const job = await this.loadJob(projectId);
    const at = this.now().toISOString();
    await this.repository.writeArtifact(
      projectId,
      "book-production-job.json",
      bookProductionJobSchema.parse({
        ...job,
        updatedAt: at,
        activity: [
          ...job.activity,
          {
            id: `activity-${String(job.activity.length + 1).padStart(3, "0")}`,
            type,
            at,
            message,
          },
        ],
      }),
    );
  }
}
