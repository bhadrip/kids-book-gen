"use client";

import { useState } from "react";

export function PdfDownloadButton({ projectId }: { projectId: string }) {
  const [state, setState] = useState<"idle" | "pending" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function download() {
    setState("pending");
    setMessage(
      "Checking all 16 text layers and rendering the approved pages locally.",
    );
    try {
      const response = await fetch(`/api/projects/${projectId}/book/proof`);
      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "storybook-proof.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
      setState("saved");
      setMessage(
        "PDF downloaded. A matching versioned proof is also saved in this local project.",
      );
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "The PDF was not exported. The approved book remains saved.",
      );
    }
  }

  return (
    <div>
      <button
        aria-describedby="pdf-download-status"
        className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-70"
        disabled={state === "pending"}
        onClick={() => void download()}
        type="button"
      >
        {state === "pending" ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          />
        ) : null}
        {state === "pending" ? "Rendering your PDF…" : "Download landscape PDF"}
      </button>
      <p
        className={`mt-3 text-sm ${state === "error" ? "text-red-800" : "text-stone-700"}`}
        id="pdf-download-status"
        role={state === "error" ? "alert" : "status"}
      >
        {message}
      </p>
    </div>
  );
}
