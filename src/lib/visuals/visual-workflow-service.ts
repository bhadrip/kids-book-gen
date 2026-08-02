import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  storyDecisionSchema,
  storyPackageSchema,
  type ProjectBrief,
  type StoryPackage,
} from "@/lib/projects/project";
import { getArtPreset, type ArtPresetId } from "@/lib/visuals/art-presets";
import type {
  GeneratedImage,
  ImageProvider,
} from "@/lib/visuals/image-provider";
import {
  characterDesignsSchema,
  imageGenerationJobSchema,
  sampleSpreadSchema,
  selectedCharacterSchema,
  visualBibleSchema,
  visualDecisionSchema,
  type CharacterDesigns,
  type ImageGenerationJob,
  type SampleSpread,
  type SelectedCharacter,
  type VisualBible,
  type VisualDecision,
} from "@/lib/visuals/visual-artifacts";
import {
  emotionalArcSchema,
  spreadMapSchema,
  visualPlanDecisionSchema,
  visualPlanIsCurrent,
  type EmotionalArc,
  type SpreadMap,
} from "@/lib/visuals/visual-narrative-artifacts";

async function readOptional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

function mimeTypeFor(filename: string): GeneratedImage["mimeType"] {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  throw new Error("The selected character asset has an unsupported format.");
}

export class VisualWorkflowService {
  public constructor(
    private readonly repository: FileProjectRepository,
    private readonly provider: ImageProvider,
    private readonly now: () => Date,
  ) {}

  public async generateCharacterDesigns(
    projectId: string,
    presetId: ArtPresetId,
  ): Promise<CharacterDesigns> {
    const { brief, story } = await this.loadApprovedStory(projectId);
    const { emotionalArc, spreadMap } = await this.loadApprovedVisualPlan(
      projectId,
      story.revision,
    );
    const preset = getArtPreset(presetId);
    const current = await readOptional(
      this.repository.readArtifact(
        projectId,
        "character-designs.json",
        characterDesignsSchema,
      ),
    );
    const revision = (current?.revision ?? 0) + 1;
    return this.runGenerationJob(
      projectId,
      `character-designs-${String(revision).padStart(2, "0")}`,
      "character_designs",
      "Creating three character designs",
      "story-decision.json",
      async () => {
        const images = await this.provider.generateCharacterDesigns({
          brief,
          story,
          preset,
          emotionalArc,
          spreadMap,
        });
        const options = await Promise.all(
          images.map(async (image, index) => {
            const filename = `character-option-r${String(revision).padStart(2, "0")}-${index + 1}.${image.extension}`;
            await this.repository.writeAsset(projectId, filename, image.bytes);
            return {
              id: `character-${index + 1}`,
              assetFilename: filename,
              altText: image.altText,
            };
          }),
        );
        const designs = characterDesignsSchema.parse({
          schemaVersion: 1,
          projectId,
          revision,
          sourceStoryRevision: story.revision,
          presetId,
          generatedAt: this.now().toISOString(),
          model: images[0].model,
          options,
        });
        await this.repository.writeArtifact(
          projectId,
          `character-designs-${String(revision).padStart(2, "0")}.json`,
          designs,
        );
        await this.repository.writeArtifact(
          projectId,
          "character-designs.json",
          designs,
        );
        return designs;
      },
    );
  }

  public async selectCharacterAndGenerateSample(
    projectId: string,
    optionId: string,
  ): Promise<SampleSpread> {
    const { brief, story } = await this.loadApprovedStory(projectId);
    const designs = await this.repository.readArtifact(
      projectId,
      "character-designs.json",
      characterDesignsSchema,
    );
    if (designs.sourceStoryRevision !== story.revision)
      throw new Error("Create fresh character designs for the approved story.");
    const option = designs.options.find(
      (candidate) => candidate.id === optionId,
    );
    if (!option) throw new Error("Choose one of the three character designs.");
    const extension = option.assetFilename.split(".").at(-1);
    if (!extension) throw new Error("The selected design has no file type.");
    const referenceAssetFilename = `character-reference-r${String(designs.revision).padStart(2, "0")}.${extension}`;
    const sourceBytes = await this.repository.readAsset(
      projectId,
      option.assetFilename,
    );
    await this.repository.writeAsset(
      projectId,
      referenceAssetFilename,
      sourceBytes,
    );
    const selected = selectedCharacterSchema.parse({
      schemaVersion: 1,
      projectId,
      characterDesignRevision: designs.revision,
      optionId,
      sourceAssetFilename: option.assetFilename,
      referenceAssetFilename,
      selectedAt: this.now().toISOString(),
    });
    await this.repository.writeArtifact(
      projectId,
      `selected-character-${String(designs.revision).padStart(2, "0")}.json`,
      selected,
    );
    await this.repository.writeArtifact(
      projectId,
      "selected-character.json",
      selected,
    );
    const visualBible = this.createVisualBible(
      projectId,
      brief,
      story,
      designs,
      selected,
    );
    await this.repository.writeArtifact(
      projectId,
      `visual-bible-${String(designs.revision).padStart(2, "0")}.json`,
      visualBible,
    );
    await this.repository.writeArtifact(
      projectId,
      "visual-bible.json",
      visualBible,
    );
    return this.generateSample(projectId, "sample_spread");
  }

  public async decideVisual(
    projectId: string,
    status: "approved" | "change_requested",
    feedback?: string,
  ): Promise<{ decision: VisualDecision; sample: SampleSpread }> {
    const sample = await this.repository.readArtifact(
      projectId,
      "sample-spread.json",
      sampleSpreadSchema,
    );
    const decision = visualDecisionSchema.parse({
      schemaVersion: 1,
      projectId,
      sampleRevision: sample.revision,
      status,
      feedback,
      decidedAt: this.now().toISOString(),
    });
    await this.repository.writeArtifact(
      projectId,
      `visual-decision-${String(sample.revision).padStart(2, "0")}.json`,
      decision,
    );
    await this.repository.writeArtifact(
      projectId,
      "visual-decision.json",
      decision,
    );
    if (status === "approved") return { decision, sample };
    if (!feedback)
      throw new Error("Tell us what to change before revising the sample.");
    const revised = await this.generateSample(
      projectId,
      "sample_revision",
      feedback,
    );
    return { decision, sample: revised };
  }

  private async generateSample(
    projectId: string,
    kind: ImageGenerationJob["kind"],
    parentFeedback?: string,
  ): Promise<SampleSpread> {
    const story = await this.repository.readArtifact(
      projectId,
      "story.json",
      storyPackageSchema,
    );
    const { emotionalArc, spreadMap } = await this.loadApprovedVisualPlan(
      projectId,
      story.revision,
    );
    const selected = await this.repository.readArtifact(
      projectId,
      "selected-character.json",
      selectedCharacterSchema,
    );
    const visualBible = await this.repository.readArtifact(
      projectId,
      "visual-bible.json",
      visualBibleSchema,
    );
    const current = await readOptional(
      this.repository.readArtifact(
        projectId,
        "sample-spread.json",
        sampleSpreadSchema,
      ),
    );
    const revision = (current?.revision ?? 0) + 1;
    const spread = story.spreads[6];
    if (!spread) throw new Error("The approved story is missing spread 7.");
    return this.runGenerationJob(
      projectId,
      `sample-spread-${String(revision).padStart(2, "0")}`,
      kind,
      parentFeedback
        ? "Revising the sample spread"
        : "Creating the sample spread",
      "visual-bible.json",
      async () => {
        const referenceBytes = await this.repository.readAsset(
          projectId,
          selected.referenceAssetFilename,
        );
        const image = await this.provider.generateSampleSpread({
          story,
          visualBible,
          emotionalArc,
          spreadMap,
          preset: getArtPreset(visualBible.presetId),
          reference: {
            bytes: referenceBytes,
            mimeType: mimeTypeFor(selected.referenceAssetFilename),
          },
          parentFeedback,
        });
        const assetFilename = `sample-spread-r${String(revision).padStart(2, "0")}.${image.extension}`;
        await this.repository.writeAsset(projectId, assetFilename, image.bytes);
        const sample = sampleSpreadSchema.parse({
          schemaVersion: 1,
          projectId,
          revision,
          sourceStoryRevision: story.revision,
          spreadNumber: 7,
          beat: spread.beat,
          text: spread.text,
          textSource: "approved_story",
          assetFilename,
          altText: image.altText,
          generatedAt: this.now().toISOString(),
          model: image.model,
          parentFeedback,
        });
        await this.repository.writeArtifact(
          projectId,
          `sample-spread-${String(revision).padStart(2, "0")}.json`,
          sample,
        );
        await this.repository.writeArtifact(
          projectId,
          "sample-spread.json",
          sample,
        );
        return sample;
      },
    );
  }

  private createVisualBible(
    projectId: string,
    brief: ProjectBrief,
    story: StoryPackage,
    designs: CharacterDesigns,
    selected: SelectedCharacter,
  ): VisualBible {
    const character = story.characters[0];
    if (!character) throw new Error("The story needs a main character first.");
    const preset = getArtPreset(designs.presetId);
    return visualBibleSchema.parse({
      schemaVersion: 1,
      projectId,
      sourceStoryRevision: story.revision,
      presetId: designs.presetId,
      characterReference: selected.referenceAssetFilename,
      createdAt: this.now().toISOString(),
      mainCharacter: {
        name: character.name,
        description: character.description,
        identityInvariants: [
          "Keep the same apparent age and child-realistic proportions.",
          "Keep facial features, skin tone, hair, and body shape consistent with the approved reference.",
          "Keep signature clothing colors and recognizable details consistent unless the story requires a change.",
        ],
      },
      signatureProps: brief.mustKeep ? [brief.mustKeep] : [],
      locations: [story.arc.beginning, story.arc.middle, story.arc.ending],
      palette: [...preset.swatches],
      textSafeArea: "upper_left",
      avoid: [...preset.avoid, "words or typography inside artwork"],
    });
  }

  private async loadApprovedStory(projectId: string): Promise<{
    brief: ProjectBrief;
    story: StoryPackage;
  }> {
    const [brief, story, decision] = await Promise.all([
      this.repository.readArtifact(projectId, "brief.json", projectBriefSchema),
      this.repository.readArtifact(projectId, "story.json", storyPackageSchema),
      readOptional(
        this.repository.readArtifact(
          projectId,
          "story-decision.json",
          storyDecisionSchema,
        ),
      ),
    ]);
    if (
      decision?.status !== "approved" ||
      decision.storyRevision !== story.revision
    ) {
      throw new Error("Approve the current story before choosing its look.");
    }
    return { brief, story };
  }

  private async loadApprovedVisualPlan(
    projectId: string,
    storyRevision: number,
  ): Promise<{ emotionalArc: EmotionalArc; spreadMap: SpreadMap }> {
    const [emotionalArc, spreadMap, decision] = await Promise.all([
      readOptional(
        this.repository.readArtifact(
          projectId,
          "emotional-arc.json",
          emotionalArcSchema,
        ),
      ),
      readOptional(
        this.repository.readArtifact(
          projectId,
          "spread-map.json",
          spreadMapSchema,
        ),
      ),
      readOptional(
        this.repository.readArtifact(
          projectId,
          "visual-plan-decision.json",
          visualPlanDecisionSchema,
        ),
      ),
    ]);
    if (
      !visualPlanIsCurrent({
        storyRevision,
        emotionalArc,
        spreadMap,
        decision,
      }) ||
      !emotionalArc ||
      !spreadMap
    )
      throw new Error(
        "Approve the current visual story plan before creating character designs.",
      );
    return { emotionalArc, spreadMap };
  }

  private async runGenerationJob<T>(
    projectId: string,
    jobKey: string,
    kind: ImageGenerationJob["kind"],
    stage: string,
    lastSavedArtifact: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const startedAt = this.now().toISOString();
    const job = imageGenerationJobSchema.parse({
      schemaVersion: 1,
      projectId,
      jobKey,
      kind,
      status: "in_progress",
      stage,
      lastSavedArtifact,
      startedAt,
      updatedAt: startedAt,
    });
    await this.saveGenerationJob(projectId, job);
    try {
      const result = await operation();
      const completedAt = this.now().toISOString();
      await this.saveGenerationJob(projectId, {
        ...job,
        status: "completed",
        updatedAt: completedAt,
        completedAt,
      });
      return result;
    } catch (error) {
      await this.saveGenerationJob(projectId, {
        ...job,
        status: "failed",
        updatedAt: this.now().toISOString(),
        failureMessage:
          "Image generation did not finish. The last saved artifact is still available.",
      });
      throw error;
    }
  }

  private async saveGenerationJob(
    projectId: string,
    job: ImageGenerationJob,
  ): Promise<void> {
    const parsed = imageGenerationJobSchema.parse(job);
    await this.repository.writeArtifact(
      projectId,
      `${job.jobKey}-job.json`,
      parsed,
    );
    await this.repository.writeArtifact(
      projectId,
      "image-generation-job.json",
      parsed,
    );
  }
}
