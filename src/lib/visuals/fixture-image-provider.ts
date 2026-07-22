import type {
  GeneratedImage,
  ImageProvider,
} from "@/lib/visuals/image-provider";

const palettes = [
  ["#f7c873", "#d25b5b", "#315b72"],
  ["#8ecae6", "#fb8500", "#264653"],
  ["#cdb4db", "#6d597a", "#f4a261"],
] as const;

export class FixtureImageProvider implements ImageProvider {
  public constructor(
    private readonly delayMs = 0,
    private readonly shouldFail = false,
  ) {}

  public async generateCharacterDesigns(
    input: Parameters<ImageProvider["generateCharacterDesigns"]>[0],
  ): Promise<[GeneratedImage, GeneratedImage, GeneratedImage]> {
    await this.wait();
    if (this.shouldFail || input.brief.originalIdea === "Fixture image failure")
      throw new Error("Deterministic fixture image failure.");
    const character = input.story.characters[0];
    return [0, 1, 2].map((index) => {
      const palette = palettes[index];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img">
  <defs><linearGradient id="bg" x1="0" x2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="#fff8e8"/></linearGradient></defs>
  <rect width="1024" height="1024" rx="72" fill="url(#bg)"/>
  <circle cx="512" cy="300" r="150" fill="${palette[1]}"/>
  <path d="M335 820 Q350 485 512 475 Q674 485 689 820 Z" fill="${palette[2]}"/>
  <circle cx="456" cy="284" r="15" fill="#201a17"/><circle cx="568" cy="284" r="15" fill="#201a17"/>
  <path d="M450 356 Q512 ${index === 1 ? 420 : 390} 574 356" fill="none" stroke="#201a17" stroke-width="18" stroke-linecap="round"/>
  <g opacity=".86"><circle cx="190" cy="820" r="70" fill="${palette[1]}"/><circle cx="835" cy="780" r="95" fill="${palette[2]}"/></g>
</svg>`;
      return {
        bytes: new TextEncoder().encode(svg),
        extension: "svg" as const,
        mimeType: "image/svg+xml" as const,
        model: "fixture-image-provider",
        altText: `${character?.name ?? "Main character"} character design ${index + 1} in the ${input.preset.label.toLowerCase()} look.`,
      };
    }) as [GeneratedImage, GeneratedImage, GeneratedImage];
  }

  public async generateSampleSpread(
    input: Parameters<ImageProvider["generateSampleSpread"]>[0],
  ): Promise<GeneratedImage> {
    await this.wait();
    if (this.shouldFail)
      throw new Error("Deterministic fixture image failure.");
    const spread = input.story.spreads[6];
    const [first, second, third] = input.preset.swatches;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img">
  <defs><linearGradient id="sky" y2="1"><stop stop-color="${first}"/><stop offset="1" stop-color="#fff8e8"/></linearGradient></defs>
  <rect width="1536" height="1024" fill="url(#sky)"/>
  <circle cx="1190" cy="215" r="130" fill="${second}" opacity=".9"/>
  <path d="M0 780 Q330 590 650 775 T1536 700 V1024 H0 Z" fill="${third}"/>
  <path d="M920 795 Q935 475 1080 465 Q1225 475 1240 795 Z" fill="#27364a"/>
  <circle cx="1080" cy="355" r="130" fill="#d97862"/>
  <path d="M810 520 Q670 390 560 535" fill="none" stroke="#f4c542" stroke-width="30" stroke-linecap="round"/>
  <circle cx="535" cy="550" r="52" fill="#f4c542"/>
  <rect x="70" y="70" width="600" height="340" rx="36" fill="#fffdf7" opacity=".2" stroke="#fffdf7" stroke-width="4" stroke-dasharray="16 14"/>
</svg>`;
    return {
      bytes: new TextEncoder().encode(svg),
      extension: "svg",
      mimeType: "image/svg+xml",
      model: "fixture-image-provider",
      altText: `Illustration for spread 7, ${spread?.beat ?? "the middle of the story"}, with open space reserved for readable text.`,
    };
  }

  public async generateBookPage(
    input: Parameters<ImageProvider["generateBookPage"]>[0],
  ): Promise<GeneratedImage> {
    await this.wait();
    if (
      this.shouldFail ||
      (input.pageId === "story-03" &&
        input.visualBible.signatureProps.some((detail) =>
          detail.includes("Fixture production failure"),
        ))
    )
      throw new Error("Deterministic fixture production failure.");
    const [first, second, third] = input.preset.swatches;
    const spreadNumber = input.storySpreadNumber ?? 0;
    const accentX = 850 + ((spreadNumber * 73) % 420);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024" role="img">
  <defs><linearGradient id="page" x2="1" y2="1"><stop stop-color="${first}"/><stop offset="1" stop-color="#fff8e8"/></linearGradient></defs>
  <rect width="1536" height="1024" fill="url(#page)"/>
  <circle cx="${accentX}" cy="230" r="145" fill="${second}" opacity=".84"/>
  <path d="M0 760 Q300 570 610 760 T1536 690 V1024 H0 Z" fill="${third}" opacity=".94"/>
  <path d="M890 820 Q900 490 1060 475 Q1220 490 1230 820 Z" fill="#27364a"/>
  <circle cx="1060" cy="365" r="135" fill="#d97862"/>
  <circle cx="1012" cy="350" r="13" fill="#201a17"/><circle cx="1108" cy="350" r="13" fill="#201a17"/>
  <rect x="65" y="65" width="610" height="360" rx="38" fill="#fffdf7" opacity=".18" stroke="#fffdf7" stroke-width="4" stroke-dasharray="16 14"/>
</svg>`;
    return {
      bytes: new TextEncoder().encode(svg),
      extension: "svg",
      mimeType: "image/svg+xml",
      model: "fixture-image-provider",
      altText: `${input.title}: ${input.beat}, illustrated with the approved recurring character and a clear text-safe area.`,
    };
  }

  private async wait(): Promise<void> {
    if (this.delayMs === 0) return;
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
