import { chromium } from "playwright";

import type { PdfRenderer } from "@/lib/proof/pdf-renderer";
import { bookPageIdSchema } from "@/lib/production/production-artifacts";

export class PlaywrightPdfRenderer implements PdfRenderer {
  public async render(html: string) {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const inspection = await page.evaluate(() => {
        const spreads = Array.from(
          document.querySelectorAll<HTMLElement>("[data-book-spread]"),
        );
        return {
          renderedPageCount: spreads.length,
          overflowPageIds: spreads
            .filter((spread) => {
              const text = spread.querySelector<HTMLElement>(
                "[data-book-text-layer]",
              );
              return Boolean(
                text &&
                (text.scrollHeight > text.clientHeight + 1 ||
                  text.scrollWidth > text.clientWidth + 1),
              );
            })
            .map((spread) => spread.dataset.pageId ?? ""),
        };
      });
      const bytes = await page.pdf({
        height: "8in",
        width: "12in",
        printBackground: true,
        preferCSSPageSize: true,
        tagged: true,
      });
      return {
        bytes: new Uint8Array(bytes),
        renderedPageCount: inspection.renderedPageCount,
        overflowPageIds: inspection.overflowPageIds.map((pageId) =>
          bookPageIdSchema.parse(pageId),
        ),
      };
    } finally {
      await browser.close();
    }
  }
}
