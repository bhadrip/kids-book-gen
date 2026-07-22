import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  storyDecisionSchema,
  storyPackageSchema,
  type StoryPackage,
} from "@/lib/projects/project";
import {
  labelForPage,
  requiredBookPageIds,
  runBookPreflight,
} from "@/lib/production/book-preflight";
import {
  bookManifestSchema,
  bookPageSchema,
  bookProductionJobSchema,
  type BookActivityEvent,
  type BookManifest,
  type BookPage,
  type BookPageId,
  type BookProductionJob,
} from "@/lib/production/production-artifacts";
import { getArtPreset } from "@/lib/visuals/art-presets";
import type {
  GeneratedImage,
  ImageProvider,
} from "@/lib/visuals/image-provider";
import {
  sampleSpreadSchema,
  selectedCharacterSchema,
  visualBibleSchema,
  visualDecisionSchema,
  type SelectedCharacter,
  type VisualBible,
} from "@/lib/visuals/visual-artifacts";

const hardConfirmationThresholdUsd = 5;

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

async function readOptional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

function mimeTypeFor(filename: string): GeneratedImage["mimeType"] {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  throw new Error("The production reference has an unsupported format.");
}

export class BudgetConfirmationRequiredError extends Error {
  public constructor(public readonly projectedCostUsd: number) {
    super(
      `This action would bring the tracked book estimate to $${projectedCostUsd.toFixed(2)}. Confirm the over-$5 cost before continuing.`,
    );
  }
}

type ProductionPrerequisites = {
  story: StoryPackage;
  selectedCharacter: SelectedCharacter;
  visualBible: VisualBible;
  sampleRevision: number;
};

type PagePlan = {
  pageId: BookPageId;
  sequence: number;
  kind: BookPage["kind"];
  storySpreadNumber?: number;
  title: string;
  beat: string;
  text: string;
  textSource: BookPage["textSource"];
  continuityFacts: string[];
  requiredReferenceDetails: string[];
  previousPageId?: BookPageId;
};

export class BookProductionService {
  public constructor(
    private readonly repository: FileProjectRepository,
    private readonly provider: ImageProvider,
    private readonly now: () => Date,
    private readonly cost: {
      softBudgetUsd: number;
      finalImageEstimateUsd: number;
    },
  ) {}

  public async estimate(projectId: string): Promise<{
    completedUnits: number;
    remainingUnits: number;
    estimatedSpentCostUsd: number;
    estimatedTotalCostUsd: number;
    softBudgetUsd: number;
    requiresOverFiveConfirmation: boolean;
  }> {
    await this.loadApprovedPrerequisites(projectId);
    const pages = await this.loadCurrentPages(projectId);
    const existingJob = await this.loadJob(projectId);
    const estimatedSpentCostUsd = roundUsd(
      existingJob?.estimatedSpentCostUsd ??
        pages.reduce((total, page) => total + page.estimatedCostUsd, 0),
    );
    const remainingUnits = requiredBookPageIds.length - pages.length;
    const estimatedTotalCostUsd = roundUsd(
      estimatedSpentCostUsd + remainingUnits * this.cost.finalImageEstimateUsd,
    );
    return {
      completedUnits: pages.length,
      remainingUnits,
      estimatedSpentCostUsd,
      estimatedTotalCostUsd,
      softBudgetUsd: this.cost.softBudgetUsd,
      requiresOverFiveConfirmation:
        estimatedTotalCostUsd > hardConfirmationThresholdUsd,
    };
  }

  public async startOrResume(
    projectId: string,
    confirmOverFive = false,
  ): Promise<BookProductionJob> {
    const prerequisites = await this.loadApprovedPrerequisites(projectId);
    const plans = this.createPlans(
      prerequisites.story,
      prerequisites.visualBible,
    );
    const existingPages = await this.loadCurrentPages(projectId);
    this.assertCurrentSources(existingPages, prerequisites);
    const existingJob = await this.loadJob(projectId);
    const spent = roundUsd(
      existingJob?.estimatedSpentCostUsd ??
        existingPages.reduce((total, page) => total + page.estimatedCostUsd, 0),
    );
    const missingPlans = plans.filter(
      (plan) => !existingPages.some((page) => page.pageId === plan.pageId),
    );
    const projected = roundUsd(
      spent + missingPlans.length * this.cost.finalImageEstimateUsd,
    );
    this.requireBudgetConfirmation(projected, confirmOverFive);

    if (missingPlans.length === 0) {
      return this.finishWithPreflight(
        projectId,
        prerequisites,
        existingJob ??
          this.createJob(projectId, existingPages, projected, confirmOverFive),
      );
    }

    let job = existingJob
      ? {
          ...existingJob,
          status: "in_progress" as const,
          stage: `Preparing ${labelForPage(missingPlans[0].pageId).toLowerCase()}`,
          currentUnitId: missingPlans[0].pageId,
          failedUnitId: undefined,
          failureMessage: undefined,
          estimatedTotalCostUsd: projected,
          overFiveConfirmed: existingJob.overFiveConfirmed || confirmOverFive,
          updatedAt: this.now().toISOString(),
        }
      : this.createJob(projectId, existingPages, projected, confirmOverFive);
    job = this.withEvent(job, {
      type: existingJob ? "resumed" : "started",
      message: existingJob
        ? `Production resumed with ${existingPages.length} of 16 pages safely saved.`
        : "Full-book production started after the approved visual sample.",
    });
    await this.saveJob(projectId, job);
    await this.saveManifest(projectId, prerequisites, job, "generating");

    const characterReference = {
      bytes: await this.repository.readAsset(
        projectId,
        prerequisites.selectedCharacter.referenceAssetFilename,
      ),
      mimeType: mimeTypeFor(
        prerequisites.selectedCharacter.referenceAssetFilename,
      ),
    };

    for (const plan of plans) {
      const current = await this.readPage(projectId, plan.pageId);
      if (current) continue;
      const persistedJob = await this.loadJob(projectId);
      if (persistedJob?.status === "paused") {
        await this.saveManifest(
          projectId,
          prerequisites,
          persistedJob,
          "paused",
        );
        return persistedJob;
      }
      job = bookProductionJobSchema.parse({
        ...(persistedJob ?? job),
        status: "in_progress",
        stage: `Creating ${labelForPage(plan.pageId).toLowerCase()}`,
        currentUnitId: plan.pageId,
        updatedAt: this.now().toISOString(),
      });
      await this.saveJob(projectId, job);

      try {
        const previous = plan.previousPageId
          ? await this.readPage(projectId, plan.previousPageId)
          : null;
        const previousReference = previous
          ? {
              bytes: await this.repository.readAsset(
                projectId,
                previous.assetFilename,
              ),
              mimeType: mimeTypeFor(previous.assetFilename),
            }
          : undefined;
        const image = await this.provider.generateBookPage({
          ...plan,
          story: prerequisites.story,
          visualBible: prerequisites.visualBible,
          preset: getArtPreset(prerequisites.visualBible.presetId),
          reference: characterReference,
          previousReference,
        });
        const page = await this.persistGeneratedPage(
          projectId,
          prerequisites,
          plan,
          image,
          1,
        );
        const afterProvider = (await this.loadJob(projectId)) ?? job;
        job = this.withEvent(
          bookProductionJobSchema.parse({
            ...afterProvider,
            completedUnitIds: Array.from(
              new Set([...afterProvider.completedUnitIds, plan.pageId]),
            ),
            currentUnitId: undefined,
            lastSavedArtifact: this.pageFilename(plan.pageId),
            estimatedSpentCostUsd: roundUsd(
              afterProvider.estimatedSpentCostUsd + page.estimatedCostUsd,
            ),
            updatedAt: this.now().toISOString(),
          }),
          {
            type: "saved",
            pageId: plan.pageId,
            message: `${labelForPage(plan.pageId)} was saved locally (${afterProvider.completedUnitIds.length + 1} of 16).`,
          },
        );
        await this.saveJob(projectId, job);
        await this.saveManifest(
          projectId,
          prerequisites,
          job,
          job.status === "paused" ? "paused" : "generating",
        );
      } catch (error) {
        const failedAt = this.now().toISOString();
        job = this.withEvent(
          bookProductionJobSchema.parse({
            ...job,
            status: "failed",
            stage: `${labelForPage(plan.pageId)} needs attention`,
            currentUnitId: undefined,
            failedUnitId: plan.pageId,
            failureMessage: `${labelForPage(plan.pageId)} did not finish. Every earlier page is still saved.`,
            updatedAt: failedAt,
          }),
          {
            type: "failed",
            pageId: plan.pageId,
            message: `${labelForPage(plan.pageId)} failed; earlier pages were preserved.`,
          },
        );
        await this.saveJob(projectId, job);
        await this.saveManifest(
          projectId,
          prerequisites,
          job,
          "needs_attention",
        );
        throw error;
      }
    }

    return this.finishWithPreflight(projectId, prerequisites, job);
  }

  public async pause(projectId: string): Promise<BookProductionJob> {
    const job = await this.loadJob(projectId);
    if (!job) throw new Error("Start book production before pausing it.");
    if (job.status !== "in_progress") return job;
    const paused = this.withEvent(
      bookProductionJobSchema.parse({
        ...job,
        status: "paused",
        stage: "Paused after the current page",
        updatedAt: this.now().toISOString(),
      }),
      {
        type: "paused",
        message: `${job.completedUnitIds.length} of 16 pages are safely saved. Production will stop before the next page.`,
      },
    );
    await this.saveJob(projectId, paused);
    const prerequisites = await this.loadApprovedPrerequisites(projectId);
    await this.saveManifest(projectId, prerequisites, paused, "paused");
    return paused;
  }

  public async keepPage(
    projectId: string,
    pageId: BookPageId,
  ): Promise<BookPage> {
    const current = await this.requirePage(projectId, pageId);
    const kept = bookPageSchema.parse({
      ...current,
      revision: current.revision + 1,
      status: "kept",
    });
    await this.persistPageArtifacts(projectId, kept);
    await this.recordPageEvent(projectId, {
      type: "kept",
      pageId,
      message: `${labelForPage(pageId)} was marked to keep in this local book.`,
    });
    await this.refreshPreflight(projectId);
    return kept;
  }

  public async editPageText(
    projectId: string,
    pageId: BookPageId,
    text: string,
  ): Promise<BookPage> {
    const current = await this.requirePage(projectId, pageId);
    const edited = bookPageSchema.parse({
      ...current,
      revision: current.revision + 1,
      text,
      textSource: "parent_edited",
      status: "draft",
      textEditedAt: this.now().toISOString(),
    });
    await this.persistPageArtifacts(projectId, edited);
    await this.recordPageEvent(projectId, {
      type: "text_edited",
      pageId,
      message: `${labelForPage(pageId)} text was saved as revision ${edited.revision}; its illustration was preserved.`,
    });
    await this.refreshPreflight(projectId);
    return edited;
  }

  public async regeneratePage(
    projectId: string,
    pageId: BookPageId,
    parentFeedback: string,
    preserveInstructions: string,
    confirmOverFive = false,
  ): Promise<BookPage> {
    const prerequisites = await this.loadApprovedPrerequisites(projectId);
    const current = await this.requirePage(projectId, pageId);
    const job = await this.requireJob(projectId);
    const projected = roundUsd(
      job.estimatedSpentCostUsd + this.cost.finalImageEstimateUsd,
    );
    this.requireBudgetConfirmation(projected, confirmOverFive);
    const plan = this.createPlans(
      prerequisites.story,
      prerequisites.visualBible,
    ).find((candidate) => candidate.pageId === pageId);
    if (!plan) throw new Error("Choose a page from the saved book.");
    const previous = plan.previousPageId
      ? await this.readPage(projectId, plan.previousPageId)
      : null;
    const image = await this.provider.generateBookPage({
      ...plan,
      story: prerequisites.story,
      visualBible: prerequisites.visualBible,
      preset: getArtPreset(prerequisites.visualBible.presetId),
      reference: {
        bytes: await this.repository.readAsset(
          projectId,
          prerequisites.selectedCharacter.referenceAssetFilename,
        ),
        mimeType: mimeTypeFor(
          prerequisites.selectedCharacter.referenceAssetFilename,
        ),
      },
      previousReference: previous
        ? {
            bytes: await this.repository.readAsset(
              projectId,
              previous.assetFilename,
            ),
            mimeType: mimeTypeFor(previous.assetFilename),
          }
        : undefined,
      parentFeedback,
      preserveInstructions,
    });
    const regenerated = await this.persistGeneratedPage(
      projectId,
      prerequisites,
      { ...plan, text: current.text, textSource: current.textSource },
      image,
      current.revision + 1,
      parentFeedback,
      preserveInstructions,
    );
    const updatedJob = this.withEvent(
      bookProductionJobSchema.parse({
        ...job,
        estimatedSpentCostUsd: projected,
        estimatedTotalCostUsd: projected,
        overFiveConfirmed: job.overFiveConfirmed || confirmOverFive,
        lastSavedArtifact: this.pageFilename(pageId),
        updatedAt: this.now().toISOString(),
      }),
      {
        type: "regenerated",
        pageId,
        message: `${labelForPage(pageId)} was regenerated as revision ${regenerated.revision}; all sibling pages were preserved.`,
      },
    );
    await this.saveJob(projectId, updatedJob);
    await this.refreshPreflight(projectId);
    return regenerated;
  }

  private createPlans(
    story: StoryPackage,
    visualBible: VisualBible,
  ): PagePlan[] {
    const requiredReferenceDetails = [
      ...visualBible.mainCharacter.identityInvariants,
      ...visualBible.signatureProps,
    ];
    const plans: PagePlan[] = [
      {
        pageId: "cover",
        sequence: 1,
        kind: "cover",
        title: "Cover",
        beat: `Promise the story of ${story.title} without revealing its ending.`,
        text: story.title,
        textSource: "book_matter",
        continuityFacts: [
          `Feature ${visualBible.mainCharacter.name} as the same recognizable protagonist from the approved reference.`,
          `Promise: ${story.promise}`,
        ],
        requiredReferenceDetails,
      },
      {
        pageId: "title-page",
        sequence: 2,
        kind: "front_matter",
        title: "Title and copyright page",
        beat: "Create a calm visual welcome before the story begins.",
        text: `${story.title}\nA family story made in Storytime Studio.`,
        textSource: "book_matter",
        continuityFacts: [
          `Use the approved palette: ${visualBible.palette.join(", ")}.`,
          "Keep this quieter than the cover and first story spread.",
        ],
        requiredReferenceDetails,
        previousPageId: "cover",
      },
    ];
    for (const spread of story.spreads) {
      const pageId =
        `story-${String(spread.number).padStart(2, "0")}` as BookPageId;
      const previousPageId =
        spread.number === 1
          ? "title-page"
          : (`story-${String(spread.number - 1).padStart(2, "0")}` as BookPageId);
      const previousBeat = story.spreads[spread.number - 2]?.beat;
      plans.push({
        pageId,
        sequence: spread.number + 2,
        kind: "story",
        storySpreadNumber: spread.number,
        title: `Story spread ${spread.number}`,
        beat: spread.beat,
        text: spread.text,
        textSource: "approved_story",
        continuityFacts: [
          `Current beat: ${spread.beat}`,
          previousBeat
            ? `Continue visibly from the prior beat: ${previousBeat}`
            : `Establish the beginning: ${story.arc.beginning}`,
          `Relevant setting fact: ${visualBible.locations[(spread.number - 1) % visualBible.locations.length]}`,
          ...visualBible.signatureProps.map(
            (detail) => `Preserve family detail: ${detail}`,
          ),
        ],
        requiredReferenceDetails,
        previousPageId,
      });
    }
    plans.push({
      pageId: "end-matter",
      sequence: 16,
      kind: "end_matter",
      title: "Closing page",
      beat: `Let the feeling of this ending settle: ${story.arc.ending}`,
      text: "The End",
      textSource: "book_matter",
      continuityFacts: [
        `Preserve the resolved ending: ${story.arc.ending}`,
        "Echo the approved palette and one familiar story motif without adding a new event.",
      ],
      requiredReferenceDetails,
      previousPageId: "story-13",
    });
    return plans;
  }

  private async loadApprovedPrerequisites(
    projectId: string,
  ): Promise<ProductionPrerequisites> {
    const [
      story,
      storyDecision,
      selectedCharacter,
      visualBible,
      sample,
      decision,
    ] = await Promise.all([
      this.repository.readArtifact(projectId, "story.json", storyPackageSchema),
      this.repository.readArtifact(
        projectId,
        "story-decision.json",
        storyDecisionSchema,
      ),
      this.repository.readArtifact(
        projectId,
        "selected-character.json",
        selectedCharacterSchema,
      ),
      this.repository.readArtifact(
        projectId,
        "visual-bible.json",
        visualBibleSchema,
      ),
      this.repository.readArtifact(
        projectId,
        "sample-spread.json",
        sampleSpreadSchema,
      ),
      this.repository.readArtifact(
        projectId,
        "visual-decision.json",
        visualDecisionSchema,
      ),
    ]);
    if (
      storyDecision.status !== "approved" ||
      storyDecision.storyRevision !== story.revision
    )
      throw new Error("Approve the current story before producing the book.");
    if (
      decision.status !== "approved" ||
      decision.sampleRevision !== sample.revision
    )
      throw new Error(
        "Approve the current visual sample before producing the book.",
      );
    if (
      sample.sourceStoryRevision !== story.revision ||
      visualBible.sourceStoryRevision !== story.revision
    )
      throw new Error(
        "The visual identity is out of date. Approve a sample for the current story first.",
      );
    if (
      visualBible.characterReference !==
      selectedCharacter.referenceAssetFilename
    )
      throw new Error("The selected character reference is out of date.");
    return {
      story,
      selectedCharacter,
      visualBible,
      sampleRevision: sample.revision,
    };
  }

  private assertCurrentSources(
    pages: readonly BookPage[],
    prerequisites: ProductionPrerequisites,
  ): void {
    if (
      pages.some(
        (page) =>
          page.sourceStoryRevision !== prerequisites.story.revision ||
          page.sourceSampleRevision !== prerequisites.sampleRevision,
      )
    )
      throw new Error(
        "The saved book belongs to an earlier approved story or visual sample. Preserve it and start a successor book before regenerating.",
      );
  }

  private requireBudgetConfirmation(
    projectedCostUsd: number,
    confirmed: boolean,
  ): void {
    if (projectedCostUsd > hardConfirmationThresholdUsd && !confirmed)
      throw new BudgetConfirmationRequiredError(projectedCostUsd);
  }

  private createJob(
    projectId: string,
    pages: readonly BookPage[],
    projected: number,
    confirmed: boolean,
  ): BookProductionJob {
    const now = this.now().toISOString();
    return bookProductionJobSchema.parse({
      schemaVersion: 1,
      projectId,
      jobKey: "full-book-production",
      status: "in_progress",
      stage: "Preparing full-book production",
      totalUnits: 16,
      completedUnitIds: pages.map((page) => page.pageId),
      lastSavedArtifact: pages.at(-1)
        ? this.pageFilename(pages.at(-1)!.pageId)
        : "visual-decision.json",
      estimatedTotalCostUsd: projected,
      estimatedSpentCostUsd: roundUsd(
        pages.reduce((total, page) => total + page.estimatedCostUsd, 0),
      ),
      softBudgetUsd: this.cost.softBudgetUsd,
      overFiveConfirmed: confirmed,
      startedAt: now,
      updatedAt: now,
      activity: [],
    });
  }

  private async finishWithPreflight(
    projectId: string,
    prerequisites: ProductionPrerequisites,
    job: BookProductionJob,
  ): Promise<BookProductionJob> {
    const pages = await this.loadCurrentPages(projectId);
    const preflight = runBookPreflight({
      projectId,
      checkedAt: this.now().toISOString(),
      pages,
    });
    await this.repository.writeArtifact(
      projectId,
      "book-preflight.json",
      preflight,
    );
    const completedAt = this.now().toISOString();
    const completed = this.withEvent(
      bookProductionJobSchema.parse({
        ...job,
        status: preflight.status === "passed" ? "completed" : "failed",
        stage:
          preflight.status === "passed"
            ? "Book ready for parent review"
            : "Book preflight needs attention",
        completedUnitIds: pages.map((page) => page.pageId),
        currentUnitId: undefined,
        failedUnitId: undefined,
        estimatedTotalCostUsd: job.estimatedSpentCostUsd,
        updatedAt: completedAt,
        completedAt,
        failureMessage:
          preflight.status === "failed"
            ? "The saved book has preflight issues to fix before review."
            : undefined,
      }),
      {
        type: "preflight_completed",
        message:
          preflight.status === "passed"
            ? "Preflight passed: all 16 pages, text layers, references, and continuity facts are present."
            : `Preflight found ${preflight.issues.length} issue${preflight.issues.length === 1 ? "" : "s"}.`,
      },
    );
    await this.saveJob(projectId, completed);
    await this.saveManifest(
      projectId,
      prerequisites,
      completed,
      preflight.status === "passed" ? "ready_for_review" : "needs_attention",
      preflight.status,
    );
    return completed;
  }

  private async refreshPreflight(projectId: string): Promise<void> {
    const prerequisites = await this.loadApprovedPrerequisites(projectId);
    const job = await this.requireJob(projectId);
    const pages = await this.loadCurrentPages(projectId);
    const preflight = runBookPreflight({
      projectId,
      checkedAt: this.now().toISOString(),
      pages,
    });
    await this.repository.writeArtifact(
      projectId,
      "book-preflight.json",
      preflight,
    );
    await this.saveManifest(
      projectId,
      prerequisites,
      job,
      preflight.status === "passed" ? "ready_for_review" : "needs_attention",
      preflight.status,
    );
  }

  private async persistGeneratedPage(
    projectId: string,
    prerequisites: ProductionPrerequisites,
    plan: PagePlan,
    image: GeneratedImage,
    revision: number,
    parentFeedback?: string,
    preserveInstructions?: string,
  ): Promise<BookPage> {
    const assetFilename = `book-${plan.pageId}-r${String(revision).padStart(2, "0")}.${image.extension}`;
    await this.repository.writeAsset(projectId, assetFilename, image.bytes);
    const page = bookPageSchema.parse({
      schemaVersion: 1,
      projectId,
      ...plan,
      revision,
      sourceStoryRevision: prerequisites.story.revision,
      sourceSampleRevision: prerequisites.sampleRevision,
      characterReference:
        prerequisites.selectedCharacter.referenceAssetFilename,
      assetFilename,
      altText: image.altText,
      status: "draft",
      parentFeedback,
      preserveInstructions,
      generatedAt: this.now().toISOString(),
      model: image.model,
      estimatedCostUsd: this.cost.finalImageEstimateUsd,
    });
    await this.persistPageArtifacts(projectId, page);
    return page;
  }

  private async persistPageArtifacts(
    projectId: string,
    page: BookPage,
  ): Promise<void> {
    await this.repository.writeArtifact(
      projectId,
      `book-page-${page.pageId}-r${String(page.revision).padStart(2, "0")}.json`,
      page,
    );
    await this.repository.writeArtifact(
      projectId,
      this.pageFilename(page.pageId),
      page,
    );
  }

  private async loadCurrentPages(projectId: string): Promise<BookPage[]> {
    const pages = await Promise.all(
      requiredBookPageIds.map((pageId) => this.readPage(projectId, pageId)),
    );
    return pages.filter((page): page is BookPage => page !== null);
  }

  private readPage(
    projectId: string,
    pageId: BookPageId,
  ): Promise<BookPage | null> {
    return readOptional(
      this.repository.readArtifact(
        projectId,
        this.pageFilename(pageId),
        bookPageSchema,
      ),
    );
  }

  private async requirePage(
    projectId: string,
    pageId: BookPageId,
  ): Promise<BookPage> {
    const page = await this.readPage(projectId, pageId);
    if (!page)
      throw new Error(`${labelForPage(pageId)} has not been made yet.`);
    return page;
  }

  private pageFilename(pageId: BookPageId): string {
    return `book-page-${pageId}.json`;
  }

  private loadJob(projectId: string): Promise<BookProductionJob | null> {
    return readOptional(
      this.repository.readArtifact(
        projectId,
        "book-production-job.json",
        bookProductionJobSchema,
      ),
    );
  }

  private async requireJob(projectId: string): Promise<BookProductionJob> {
    const job = await this.loadJob(projectId);
    if (!job) throw new Error("Start book production first.");
    return job;
  }

  private async saveJob(
    projectId: string,
    job: BookProductionJob,
  ): Promise<void> {
    await this.repository.writeArtifact(
      projectId,
      "book-production-job.json",
      bookProductionJobSchema.parse(job),
    );
  }

  private async saveManifest(
    projectId: string,
    prerequisites: ProductionPrerequisites,
    job: BookProductionJob,
    status: BookManifest["status"],
    preflightStatus: BookManifest["preflightStatus"] = "pending",
  ): Promise<void> {
    const manifest = bookManifestSchema.parse({
      schemaVersion: 1,
      projectId,
      sourceStoryRevision: prerequisites.story.revision,
      sourceSampleRevision: prerequisites.sampleRevision,
      status,
      pageIds: job.completedUnitIds,
      estimatedSpentCostUsd: job.estimatedSpentCostUsd,
      preflightStatus,
      updatedAt: this.now().toISOString(),
    });
    await this.repository.writeArtifact(projectId, "book.json", manifest);
  }

  private withEvent(
    job: BookProductionJob,
    input: Omit<BookActivityEvent, "id" | "at">,
  ): BookProductionJob {
    const at = this.now().toISOString();
    return bookProductionJobSchema.parse({
      ...job,
      activity: [
        ...job.activity,
        {
          ...input,
          id: `activity-${String(job.activity.length + 1).padStart(3, "0")}`,
          at,
        },
      ],
    });
  }

  private async recordPageEvent(
    projectId: string,
    event: Omit<BookActivityEvent, "id" | "at">,
  ): Promise<void> {
    const job = await this.requireJob(projectId);
    await this.saveJob(projectId, this.withEvent(job, event));
  }
}
