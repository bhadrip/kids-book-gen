import type { StoryPackage } from "@/lib/projects/project";
import {
  bookPlanSchema,
  type BookPlan,
  type BookPlanPage,
  type BookPageId,
} from "@/lib/production/production-artifacts";
import type { VisualBible } from "@/lib/visuals/visual-artifacts";
import type {
  EmotionalArc,
  SpreadMap,
} from "@/lib/visuals/visual-narrative-artifacts";

export function deriveBookPlan(input: {
  projectId: string;
  story: StoryPackage;
  visualBible: VisualBible;
  emotionalArc: EmotionalArc;
  spreadMap: SpreadMap;
  sampleRevision: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
}): BookPlan {
  const { story, visualBible } = input;
  const requiredReferenceDetails = [
    ...visualBible.mainCharacter.identityInvariants,
    ...visualBible.signatureProps,
  ];
  const familiarDetail =
    visualBible.signatureProps[0] ??
    `the recognizable features of ${visualBible.mainCharacter.name}`;
  const pages: BookPlanPage[] = [
    {
      pageId: "cover",
      sequence: 1,
      kind: "cover",
      title: "Cover",
      beat: `Promise the story of ${story.title} without revealing its ending.`,
      text: story.title,
      textSource: "book_matter",
      illustrationDescription: `A strong cover composition featuring ${visualBible.mainCharacter.name} and ${familiarDetail}, suggesting ${story.promise.toLowerCase()} without revealing the ending.`,
      continuityFacts: [
        `Feature ${visualBible.mainCharacter.name} as the same recognizable protagonist from the approved reference.`,
        `Promise: ${story.promise}`,
      ],
      requiredReferenceDetails,
      textSafeArea: visualBible.textSafeArea,
    },
    {
      pageId: "title-page",
      sequence: 2,
      kind: "front_matter",
      title: "Title and copyright page",
      beat: "Create a calm visual welcome before the story begins.",
      text: `${story.title}\nA family story made in Storytime Studio.`,
      textSource: "book_matter",
      illustrationDescription: `A quiet title-page vignette using ${visualBible.palette.join(", ")} and one familiar motif from the cover, with generous calm space for the separate title and copyright text.`,
      continuityFacts: [
        `Use the approved palette: ${visualBible.palette.join(", ")}.`,
        "Keep this quieter than the cover and first story spread.",
      ],
      requiredReferenceDetails,
      textSafeArea: visualBible.textSafeArea,
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
    const location =
      visualBible.locations[(spread.number - 1) % visualBible.locations.length];
    const visualSpread = input.spreadMap.spreads.find(
      (candidate) => candidate.spreadNumber === spread.number,
    );
    if (!visualSpread)
      throw new Error(
        `The approved visual plan is missing spread ${spread.number}.`,
      );
    const characterExpressions = input.emotionalArc.characters.flatMap(
      (character) => {
        const beat = character.beats.find(
          (candidate) => candidate.spreadNumber === spread.number,
        );
        return beat
          ? [
              {
                characterName: character.characterName,
                outwardExpression: beat.outwardExpression,
                intensity: beat.intensity,
              },
            ]
          : [];
      },
    );
    pages.push({
      pageId,
      sequence: spread.number + 2,
      kind: "story",
      storySpreadNumber: spread.number,
      title: `Story spread ${spread.number}`,
      beat: spread.beat,
      text: spread.text,
      textSource: "approved_story",
      illustrationDescription: `${visualSpread.illustrationIntent} Main action: ${visualSpread.mainAction} Location: ${location}. Preserve the approved character and family details while leaving the ${visualBible.textSafeArea.replace("_", " ")} calm for the separate text layer.`,
      continuityFacts: [
        `Current beat: ${visualSpread.storyBeat}`,
        `Main action: ${visualSpread.mainAction}`,
        `Emotional movement: ${visualSpread.emotionalMovement}`,
        previousBeat
          ? `Continue visibly from the prior beat: ${previousBeat}`
          : `Establish the beginning: ${story.arc.beginning}`,
        `Relevant setting fact: ${location}`,
        ...visualBible.signatureProps.map(
          (detail) => `Preserve family detail: ${detail}`,
        ),
      ],
      requiredReferenceDetails,
      storyboardScene: {
        mainAction: visualSpread.mainAction,
        emotionalMovement: visualSpread.emotionalMovement,
        illustrationIntent: visualSpread.illustrationIntent,
        mustShow: visualSpread.mustShow,
        mustAvoid: visualSpread.mustAvoid,
        characterExpressions,
      },
      textSafeArea: visualBible.textSafeArea,
      previousPageId,
    });
  }

  pages.push({
    pageId: "end-matter",
    sequence: 16,
    kind: "end_matter",
    title: "Closing page",
    beat: `Let the feeling of this ending settle: ${story.arc.ending}`,
    text: "The End",
    textSource: "book_matter",
    illustrationDescription: `A quiet closing image that echoes ${familiarDetail} and the approved palette after the resolution, without introducing a new story event.`,
    continuityFacts: [
      `Preserve the resolved ending: ${story.arc.ending}`,
      "Echo the approved palette and one familiar story motif without adding a new event.",
    ],
    requiredReferenceDetails,
    textSafeArea: visualBible.textSafeArea,
    previousPageId: "story-13",
  });

  return bookPlanSchema.parse({
    schemaVersion: 1,
    projectId: input.projectId,
    revision: input.revision,
    sourceStoryRevision: story.revision,
    sourceSampleRevision: input.sampleRevision,
    sourceVisualPlanRevision: input.spreadMap.revision,
    pages,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
