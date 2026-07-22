import type { BookPageId } from "@/lib/production/production-artifacts";

export type PdfRenderResult = {
  bytes: Uint8Array;
  renderedPageCount: number;
  overflowPageIds: BookPageId[];
};

export interface PdfRenderer {
  render(html: string): Promise<PdfRenderResult>;
}
