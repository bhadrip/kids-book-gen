import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  selectedDirectionSchema,
  storyDecisionSchema,
  storyDirectionsSchema,
  storyPackageSchema,
  textGenerationJobSchema,
} from "@/lib/projects/project";

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
  nextAction: { href: string; label: string; reason: string };
};

async function readOptional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

export async function getProjectProgress(
  repository: FileProjectRepository,
  projectId: string,
): Promise<ProjectProgress> {
  const [brief, directions, selected, story, decision, job] = await Promise.all(
    [
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
    ],
  );

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

  if (job?.status === "in_progress") {
    if (job.kind === "directions") idea = "In progress";
    if (job.kind === "directions_revision") directionsStatus = "In progress";
    if (job.kind === "story" || job.kind === "story_revision")
      storyStatus = "In progress";
    return {
      idea,
      directions: directionsStatus,
      story: storyStatus,
      nextAction: {
        href: `/projects/${projectId}`,
        label: "Check generation status",
        reason: `${job.stage} is in progress. ${job.lastSavedArtifact} is safely saved; refresh this overview to check the result.`,
      },
    };
  }

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
      nextAction: {
        href: `/projects/${projectId}/directions`,
        label: selected ? "Retry story draft" : "Choose a story direction",
        reason: selected
          ? "Your direction is saved; the story draft still needs to be created."
          : "Review three saved possibilities and choose how the story should go.",
      },
    };
  }
  return {
    idea,
    directions: directionsStatus,
    story: storyStatus,
    nextAction: {
      href: `/projects/${projectId}/story`,
      label:
        storyStatus === "Approved" ? "View approved story" : "Review story",
      reason:
        storyStatus === "Approved"
          ? "Your approved manuscript is saved and ready for the visual stage."
          : job?.status === "failed"
            ? "The latest valid manuscript is saved. Review it and safely retry only the requested change."
            : "Review the saved manuscript, then approve it or request a change.",
    },
  };
}
