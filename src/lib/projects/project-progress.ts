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
  bookManifestSchema,
  bookProductionJobSchema,
} from "@/lib/production/production-artifacts";
import {
  characterDesignsSchema,
  imageGenerationJobSchema,
  sampleSpreadSchema,
  selectedCharacterSchema,
  visualDecisionSchema,
} from "@/lib/visuals/visual-artifacts";

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
    characterDesigns,
    selectedCharacter,
    sample,
    visualDecision,
    imageJob,
    book,
    bookJob,
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
      repository.readArtifact(projectId, "book.json", bookManifestSchema),
    ),
    readOptional(
      repository.readArtifact(
        projectId,
        "book-production-job.json",
        bookProductionJobSchema,
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
    ((sample && sample.sourceStoryRevision !== story.revision) ||
      (characterDesigns &&
        characterDesigns.sourceStoryRevision !== story.revision)),
  );
  let look: CheckpointStatus = visualOutOfDate
    ? "Out of date"
    : sample &&
        visualDecision?.status === "approved" &&
        visualDecision.sampleRevision === sample.revision
      ? "Approved"
      : sample
        ? "Ready for your review"
        : selectedCharacter || characterDesigns
          ? "Needs attention"
          : "Not started";
  const bookOutOfDate = Boolean(
    book &&
    story &&
    sample &&
    (book.sourceStoryRevision !== story.revision ||
      book.sourceSampleRevision !== sample.revision),
  );
  let bookStatus: CheckpointStatus = bookOutOfDate
    ? "Out of date"
    : book?.status === "ready_for_review"
      ? "Ready for your review"
      : book?.status === "needs_attention"
        ? "Needs attention"
        : book?.status === "generating" || book?.status === "paused"
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

  if (imageJob?.status === "failed") look = "Needs attention";

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
            : imageJob?.status === "failed"
              ? "Retry character designs"
              : "Choose the visual identity",
        reason: sample
          ? "Review the illustration with its separate, editable text layer."
          : characterDesigns
            ? "Three saved character directions are ready for your choice."
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
        bookStatus === "Ready for your review"
          ? "Review the saved book"
          : bookJob?.status === "failed"
            ? "Retry the failed page"
            : "Start full-book production",
      reason:
        bookStatus === "Ready for your review"
          ? "All 16 required pages passed preflight and are ready for page-by-page review."
          : bookJob?.status === "failed"
            ? `${bookJob.completedUnitIds.length} earlier pages are safe. Retry only ${bookJob.failedUnitId ? labelForBookPage(bookJob.failedUnitId) : "the failed page"}.`
            : "The approved story, character reference, Visual Bible, and sample are ready for sequential book production.",
    },
  };
}

function labelForBookPage(pageId: string): string {
  if (pageId === "cover") return "the cover";
  if (pageId === "title-page") return "the title page";
  if (pageId === "end-matter") return "the closing page";
  return `story spread ${Number(pageId.slice(-2))}`;
}
