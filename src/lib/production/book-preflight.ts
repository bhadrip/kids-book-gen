import {
  bookPreflightSchema,
  type BookPage,
  type BookPageId,
  type BookPreflight,
  type BookPreflightIssue,
} from "@/lib/production/production-artifacts";

export const requiredBookPageIds: readonly BookPageId[] = [
  "cover",
  "title-page",
  "story-01",
  "story-02",
  "story-03",
  "story-04",
  "story-05",
  "story-06",
  "story-07",
  "story-08",
  "story-09",
  "story-10",
  "story-11",
  "story-12",
  "story-13",
  "end-matter",
] as const;

type PreflightPage = Pick<
  BookPage,
  | "pageId"
  | "text"
  | "characterReference"
  | "requiredReferenceDetails"
  | "continuityFacts"
>;

export function runBookPreflight(input: {
  projectId: string;
  checkedAt: string;
  pages: readonly PreflightPage[];
}): BookPreflight {
  const pages = new Map(input.pages.map((page) => [page.pageId, page]));
  const issues: BookPreflightIssue[] = [];

  for (const pageId of requiredBookPageIds) {
    const page = pages.get(pageId);
    if (!page) {
      issues.push({
        code: "missing_page",
        pageId,
        message: `${labelForPage(pageId)} is missing. Resume production to create it.`,
      });
      continue;
    }
    if (page.text.trim().length === 0)
      issues.push({
        code: "empty_text",
        pageId,
        message: `${labelForPage(pageId)} needs a non-empty text layer.`,
      });
    if (page.characterReference.trim().length === 0)
      issues.push({
        code: "missing_character_reference",
        pageId,
        message: `${labelForPage(pageId)} is missing the approved character reference.`,
      });
    if (page.requiredReferenceDetails.length === 0)
      issues.push({
        code: "missing_reference_details",
        pageId,
        message: `${labelForPage(pageId)} is missing the approved character details it must preserve.`,
      });
    if (page.continuityFacts.length === 0)
      issues.push({
        code: "missing_continuity_facts",
        pageId,
        message: `${labelForPage(pageId)} is missing continuity instructions.`,
      });
  }

  return bookPreflightSchema.parse({
    schemaVersion: 1,
    projectId: input.projectId,
    checkedAt: input.checkedAt,
    status: issues.length === 0 ? "passed" : "failed",
    requiredPageIds: requiredBookPageIds,
    issues,
  });
}

export function labelForPage(pageId: BookPageId): string {
  if (pageId === "cover") return "Cover";
  if (pageId === "title-page") return "Title and copyright page";
  if (pageId === "end-matter") return "Closing page";
  return `Story spread ${Number(pageId.slice(-2))}`;
}
