import { readAppConfig } from "@/lib/config/app-config";

export default function HomePage() {
  const config = readAppConfig(process.env);
  const generationReady = Boolean(config.openAiApiKey);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em] text-amber-800 uppercase">
        Storytime Studio
      </p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-950">
        A family idea, made into a real storybook.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
        The V0 foundation is ready. The next phase will help you shape an
        original idea into a story your child can recognize and reread.
      </p>
      <section
        className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        aria-label="Local setup status"
      >
        <h2 className="text-lg font-semibold text-stone-950">
          Local generation
        </h2>
        <p className="mt-2 text-stone-700">
          {generationReady
            ? `Ready to use ${config.textModel} and ${config.imageModel}.`
            : "Add OPENAI_API_KEY to .env.local before generating a story."}
        </p>
      </section>
    </main>
  );
}
