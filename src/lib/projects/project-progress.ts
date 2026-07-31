import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  selectedDirectionSchema,
  storyDecisionSchema,
  storyDirectionsSchema,
  storyPackageSchema,
  textGenerationJobSchema,
} from "@/lib/projects/project";
import {
  bookDecisionSchema,
  bookManifestSchema,
  bookPageSchema,
  bookPlanDecisionSchema,
  bookPlanSchema,
  bookProductionJobSchema,
} from "@/lib/production/production-artifacts";
import { requiredBookPageIds } from "@/lib/production/book-preflight";
import {
  characterDesignsSchema,
  imageGenerationJobSchema,
  sampleSpreadSchema,
  selectedCharacterSchema,
  visualDecisionSchema,
} from "@/lib/visuals/visual-artifacts";
import {
  emotionalArcSchema,
  spreadMapSchema,
  visualPlanDecisionSchema,
  visualPlanIsCurrent,
  visualPlanJobSchema,
} from "@/lib/visuals/visual-narrative-artifacts";

export type CheckpointStatus =
  | "Not started"
  | "In progress"
  | "Ready for your review"
  | "Approved"
  | "Needs attention"
  | "Out of date";

type ProjectProgress = {
  idea: CheckpointStatus;
  directions: CheckpointStatus;
  story: CheckpointStatus;
  look: CheckpointStatus;
  book: CheckpointStatus;
  nextAction: { href: string; label: string; reason: string };
};

async function readOptional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

export async function getProjectProgress(
  repository: FileProjectRepository,
  projectId: string,
): Promise<ProjectProgress> {
  const [
    brief,
    directions,
    selected,
    story,
    decision,
    job,
    emotionalArc,
    spreadMap,
    visualPlanDecision,
    visualPlanJob,
    characterDesigns,
    selectedCharacter,
    sample,
    visualDecision,
    imageJob,
    bookPlan,
    bookPlanDecision,
    book,
    bookJob,
    bookDecision,
    bookPages,
  ] = await Promise.all([
    readOptional(
      repository.readArtifact(projectId, "brief.json", projectBriefSchema),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "directions.json",
        storyDirectionsSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "selected-direction.json",
        selectedDirectionSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(projectId, "story.json", storyPackageSchema),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "story-decision.json",
        storyDecisionSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "text-generation-job.json",
        textGenerationJobSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "emotional-arc.json",
        emotionalArcSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(projectId, "spread-map.json", spreadMapSchema),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "visual-plan-decision.json",
        visualPlanDecisionSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "visual-plan-job.json",
        visualPlanJobSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "character-designs.json",
        characterDesignsSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "selected-character.json",
        selectedCharacterSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "sample-spread.json",
        sampleSpreadSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "visual-decision.json",
        visualDecisionSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "image-generation-job.json",
        imageGenerationJobSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(projectId, "book-plan.json", bookPlanSchema),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "book-plan-decision.json",
        bookPlanDecisionSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(projectId, "book.json", bookManifestSchema),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "book-production-job.json",
        bookProductionJobSchema,
      ),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "book-decision.json",
        bookDecisionSchema,
      ),
    ),
    Promise.all(
      requiredBookPageIds.map((pageId) =>
        readOptional(
          repository.readArtifact(
            projectId,
            `book-page-${pageId}.json`,
            bookPageSchema,
          ),
        ),
      ),
    ),
  ]);

  let idea: CheckpointStatus = directions
    ? "Approved"
    : brief
      ? "Needs attention"
      : "Not started";
  let directionsStatus: CheckpointStatus = selected
    ? "Approved"
    : directions
      ? "Ready for your review"
      : "Not started";
  let storyStatus: CheckpointStatus =
    story &&
    decision?.status === "approved" &&
    decision.storyRevision === story.revision
      ? "Approved"
      : story
        ? "Ready for your review"
        : selected
          ? "Needs attention"
          : "Not started";
  const visualOutOfDate = Boolean(
    story &&
    ((spreadMap && spreadMap.sourceStoryRevision !== story.revision) ||
      (emotionalArc && emotionalArc.sourceStoryRevision !== story.revision) ||
      (sample && sample.sourceStoryRevision !== story.revision) ||
      (characterDesigns &&
        characterDesigns.sourceStoryRevision !== story.revision)),
  );
  const visualPlanApproved = Boolean(
    story &&
    visualPlanIsCurrent({
      storyRevision: story.revision,
      emotionalArc,
      spreadMap,
      decision: visualPlanDecision,
    }),
  );
  let look: CheckpointStatus = visualOutOfDate
    ? "Out of date"
    : sample &&
        visualDecision?.status === "approved" &&
        visualDecision.sampleRevision === sample.revision
      ? "Approved"
      : sample
        ? "Ready for your review"
        : selectedCharacter || characterDesigns || visualPlanApproved
          ? "Needs attention"
          : spreadMap
            ? "Ready for your review"
            : "Not started";
  const bookOutOfDate = Boolean(
    book &&
    story &&
    sample &&
    (book.sourceStoryRevision !== story.revision ||
      book.sourceSampleRevision !== sample.revision),
  );
  const bookPlanCurrent = Boolean(
    bookPlan &&
    story &&
    sample &&
    bookPlan.sourceStoryRevision === story.revision &&
    bookPlan.sourceSampleRevision === sample.revision,
  );
  const bookPlanApproved = Boolean(
    bookPlanCurrent &&
    bookPlan &&
    bookPlanDecision?.status === "approved" &&
    bookPlanDecision.planRevision === bookPlan.revision,
  );
  const bookApproved = Boolean(
    bookDecision &&
    bookPlan &&
    bookDecision.sourcePlanRevision === bookPlan.revision &&
    bookDecision.sourceStoryRevision === bookPlan.sourceStoryRevision &&
    bookDecision.sourceSampleRevision === bookPlan.sourceSampleRevision &&
    requiredBookPageIds.every((pageId) => {
      const page = bookPages.find((candidate) => candidate?.pageId === pageId);
      const approvedPage = bookDecision.pageRevisions.find(
        (candidate) => candidate.pageId === pageId,
      );
      return page && approvedPage?.revision === page.revision;
    }),
  );
  let bookStatus: CheckpointStatus = bookOutOfDate
    ? "Out of date"
    : bookApproved
      ? "Approved"
      : book?.status === "ready_for_review"
        ? "Ready for your review"
        : book?.status === "needs_attention"
          ? "Needs attention"
          : book?.status === "generating" || book?.status === "paused"
            ? "In progress"
            : bookPlanCurrent && !bookPlanApproved
              ? "Ready for your review"
              : bookPlanApproved
                ? "In progress"
                : "Not started";

  if (job?.status === "in_progress") {
    if (job.kind === "directions") idea = "In progress";
    if (job.kind === "directions_revision") directionsStatus = "In progress";
    if (job.kind === "story" || job.kind === "story_revision")
      storyStatus = "In progress";
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}`,
        label: "Check generation status",
        reason: `${job.stage} is in progress. ${job.lastSavedArtifact} is safely saved; refresh this overview to check the result.`,
      },
    };
  }

  if (imageJob?.status === "in_progress") {
    look = "In progress";
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}`,
        label: "Check visual generation status",
        reason: `${imageJob.stage} is in progress. ${imageJob.lastSavedArtifact} is safely saved; refresh this overview to check the result.`,
      },
    };
  }

  if (visualPlanJob?.status === "in_progress") {
    look = "In progress";
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}/look`,
        label: "Check visual story planning",
        reason: `${visualPlanJob.stage} is in progress. ${visualPlanJob.lastSavedArtifact} is safely saved.`,
      },
    };
  }

  if (imageJob?.status === "failed") look = "Needs attention";
  if (visualPlanJob?.status === "failed") look = "Needs attention";

  if (bookJob?.status === "in_progress" || bookJob?.status === "paused") {
    bookStatus = "In progress";
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}/book`,
        label:
          bookJob.status === "paused"
            ? "Resume saved book production"
            : "Check or resume book production",
        reason:
          bookJob.status === "paused"
            ? `${bookJob.completedUnitIds.length} of 16 pages are safely saved. Resume with the next missing page.`
            : `${bookJob.stage}. ${bookJob.completedUnitIds.length} of 16 pages are safely saved. If the app restarted, open the book to resume from the first missing page.`,
      },
    };
  }

  if (bookJob?.status === "failed") bookStatus = "Needs attention";

  if (job?.status === "failed") {
    if (job.kind === "directions") idea = "Needs attention";
    if (job.kind === "directions_revision")
      directionsStatus = "Needs attention";
    if (job.kind === "story" || job.kind === "story_revision")
      storyStatus = "Needs attention";
  }

  if (!directions) {
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}/idea`,
        label: brief ? "Retry story directions" : "Shape the story idea",
        reason: brief
          ? "Your idea is saved; directions still need to be created."
          : "Tell us the family idea and the details the story must keep.",
      },
    };
  }
  if (!story) {
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}/directions`,
        label: selected ? "Retry story draft" : "Choose a story direction",
        reason: selected
          ? "Your direction is saved; the story draft still needs to be created."
          : "Review three saved possibilities and choose how the story should go.",
      },
    };
  }
  if (storyStatus !== "Approved") {
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}/story`,
        label: "Review story",
        reason:
          job?.status === "failed"
            ? "The latest valid manuscript is saved. Review it and safely retry only the requested change."
            : "Review the saved manuscript, then approve it or request a change.",
      },
    };
  }

  if (look !== "Approved") {
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      look,
      book: bookStatus,
      nextAction: {
        href: `/projects/${projectId}/look`,
        label: sample
          ? "Review the sample spread"
          : characterDesigns
            ? "Choose a character design"
            : spreadMap && !visualPlanApproved
              ? "Review the visual story plan"
              : visualPlanJob?.status === "failed"
                ? "Retry the visual story plan"
                : !visualPlanApproved
                  ? "Create the visual story plan"
                  : imageJob?.status === "failed"
                    ? "Retry character designs"
                    : "Choose the visual identity",
        reason: sample
          ? "Review the illustration with its separate, editable text layer."
          : characterDesigns
            ? "Three saved character directions are ready for your choice."
            : spreadMap && !visualPlanApproved
              ? "Check the main action and emotional movement across all 13 spreads before making artwork."
              : visualPlanJob?.status === "failed"
                ? "Your approved story and last valid plan are safe. Retry only visual story planning."
                : !visualPlanApproved
                  ? "Plan the action and emotional movement across the approved story before choosing an art look."
                  : imageJob?.status === "failed"
                    ? "Your approved story is safe. Retry only the visual draft when ready."
                    : "Choose a curated art look, then compare three character designs.",
      },
    };
  }

  return {
    idea,
    directions: directionsStatus,
    story: storyStatus,
    look,
    book: bookStatus,
    nextAction: {
      href: `/projects/${projectId}/book`,
      label:
        bookStatus === "Approved"
          ? "Review the approved book"
          : bookStatus === "Ready for your review"
            ? book?.status === "ready_for_review"
              ? "Review the saved book"
              : "Review the book plan"
            : bookJob?.status === "failed"
              ? "Retry the failed page"
              : bookPlanApproved
                ? "Start full-book production"
                : "Preview the book plan",
      reason:
        bookStatus === "Approved"
          ? "The one final decision covers the current revisions of all 16 pages."
          : book?.status === "ready_for_review"
            ? "All 16 required pages passed preflight and are ready for page-by-page review."
            : bookJob?.status === "failed"
              ? `${bookJob.completedUnitIds.length} earlier pages are safe. Retry only ${bookJob.failedUnitId ? labelForBookPage(bookJob.failedUnitId) : "the failed page"}.`
              : bookPlanCurrent && !bookPlanApproved
                ? "Review the saved zero-cost contact sheet and wireframes, then approve the current plan before image generation."
                : bookPlanApproved
                  ? "The approved book plan is ready for sequential image production."
                  : "Preview all 16 pages as a zero-cost contact sheet and wireframe reader before image generation.",
    },
  };
}

function labelForBookPage(pageId: string): string {
  if (pageId === "cover") return "the cover";
  if (pageId === "title-page") return "the title page";
  if (pageId === "end-matter") return "the closing page";
  return `story spread ${Number(pageId.slice(-2))}`;
}
