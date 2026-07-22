import type { BookPageId } from "@/lib/production/production-artifacts";

export type BookLayoutPage = {
  pageId: BookPageId;
  sequence: number;
  title: string;
  text: string;
  altText: string;
  imageUrl: string;
  textSafeArea: "upper_left" | "upper_right" | "lower_left" | "lower_right";
};

const textPositions: Record<BookLayoutPage["textSafeArea"], string> = {
  upper_left: "book-spread__text--upper-left",
  upper_right: "book-spread__text--upper-right",
  lower_left: "book-spread__text--lower-left",
  lower_right: "book-spread__text--lower-right",
};

export function bookTextPositionClass(
  textSafeArea: BookLayoutPage["textSafeArea"],
): string {
  return textPositions[textSafeArea];
}

export const bookLayoutStyles = `
  .book-spread, .book-spread * { box-sizing: border-box; }
  .book-spread { position: relative; width: 100%; aspect-ratio: 3 / 2; overflow: hidden; background: #d6d3d1; break-after: page; page-break-after: always; }
  .book-spread:last-child { break-after: auto; page-break-after: auto; }
  .book-spread__art { position: absolute; inset: 0; background-position: center; background-repeat: no-repeat; background-size: cover; }
  .book-spread__text { position: absolute; width: 42%; max-height: 62%; overflow: hidden; border-radius: 0.8rem; background: rgba(255, 253, 247, 0.95); color: #1c1917; padding: 2.6%; box-shadow: 0 0.5rem 2rem rgba(28, 25, 23, 0.2); font-family: Arial, Helvetica, sans-serif; }
  .book-spread__text--upper-left { top: 7%; left: 5%; }
  .book-spread__text--upper-right { top: 7%; right: 5%; }
  .book-spread__text--lower-left { bottom: 7%; left: 5%; }
  .book-spread__text--lower-right { right: 5%; bottom: 7%; }
  .book-spread__title { margin: 0 0 0.55rem; color: #075985; font-size: clamp(0.62rem, 1.2vw, 1rem); font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
  .book-spread__copy { margin: 0; font-size: clamp(0.72rem, 1.65vw, 1.3rem); line-height: 1.45; white-space: pre-line; }
  @page { size: 12in 8in; margin: 0; }
  @media print {
    .book-spread { width: 12in; height: 8in; aspect-ratio: auto; }
    .book-spread__title { font-size: 12pt; }
    .book-spread__copy { font-size: 16pt; }
  }
`;

export function BookLayoutStyle() {
  return <style>{bookLayoutStyles}</style>;
}

export function BookSpread({ page }: { page: BookLayoutPage }) {
  return (
    <article
      aria-label={`Page ${page.sequence}: ${page.title}`}
      className="book-spread"
      data-book-spread
      data-page-id={page.pageId}
    >
      <div
        aria-label={page.altText}
        className="book-spread__art"
        role="img"
        style={{ backgroundImage: `url(${JSON.stringify(page.imageUrl)})` }}
      />
      <div
        className={`book-spread__text ${bookTextPositionClass(page.textSafeArea)}`}
        data-book-text-layer
      >
        <h2 className="book-spread__title">{page.title}</h2>
        <p className="book-spread__copy">{page.text}</p>
      </div>
    </article>
  );
}
