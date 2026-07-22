import {
  bookTextPositionClass,
  bookLayoutStyles,
  type BookLayoutPage,
} from "@/components/book-spread";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderBookHtml(title: string, pages: BookLayoutPage[]): string {
  const spreads = pages
    .map(
      (page) =>
        `<article aria-label="Page ${page.sequence}: ${escapeHtml(page.title)}" class="book-spread" data-book-spread="" data-page-id="${page.pageId}"><div aria-label="${escapeHtml(page.altText)}" class="book-spread__art" role="img" style="background-image:url('${page.imageUrl}')"></div><div class="book-spread__text ${bookTextPositionClass(page.textSafeArea)}" data-book-text-layer=""><h2 class="book-spread__title">${escapeHtml(page.title)}</h2><p class="book-spread__copy">${escapeHtml(page.text)}</p></div></article>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>${bookLayoutStyles}</style></head><body style="margin:0;background:#171412"><main>${spreads}</main></body></html>`;
}
