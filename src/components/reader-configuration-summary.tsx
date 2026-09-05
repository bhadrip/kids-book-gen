import type { ReaderConfiguration } from "@/lib/readers/reader-profile";
import { readerConfigurationSummary } from "@/lib/readers/reader-profile";

export function ReaderConfigurationSummary({
  reader,
}: {
  reader?: ReaderConfiguration;
}) {
  return (
    <aside className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
      <p className="text-xs font-semibold tracking-wide uppercase">
        Confirmed reader profile
      </p>
      <p className="mt-1">
        {reader
          ? readerConfigurationSummary(reader)
          : "Reader details need confirmation before new generation."}
      </p>
    </aside>
  );
}
