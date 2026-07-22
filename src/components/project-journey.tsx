"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { CheckpointStatus } from "@/lib/projects/project-progress";

type ProjectJourneyProps = {
  current: "idea" | "directions" | "story" | "look" | "book" | "overview";
  projectId: string;
  projectTitle: string;
  statuses: {
    idea: CheckpointStatus;
    directions: CheckpointStatus;
    story: CheckpointStatus;
    look: CheckpointStatus;
    book: CheckpointStatus;
  };
};

const checkpoints = [
  { id: "idea", label: "Shape the idea" },
  { id: "directions", label: "Choose a direction" },
  { id: "story", label: "Approve the story" },
  { id: "look", label: "Approve the look" },
  { id: "book", label: "Make the book" },
] as const;

export function ProjectJourney({
  current,
  projectId,
  projectTitle,
  statuses,
}: ProjectJourneyProps) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const markPending = () => setPending(true);
    const markSettled = () => setPending(false);
    window.addEventListener("storytime:form-pending", markPending);
    window.addEventListener("storytime:form-settled", markSettled);
    return () => {
      window.removeEventListener("storytime:form-pending", markPending);
      window.removeEventListener("storytime:form-settled", markSettled);
    };
  }, []);

  return (
    <header>
      <p className="text-sm font-semibold tracking-[0.18em] text-amber-800 uppercase">
        Storytime Studio
      </p>
      <p className="mt-3 text-sm text-stone-600">Project</p>
      <p className="text-lg font-semibold text-stone-950">{projectTitle}</p>
      <nav aria-label="Story workflow" className="mt-6">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {checkpoints.map((checkpoint, index) => {
            const isCurrent = current === checkpoint.id;
            const status =
              pending && isCurrent ? "In progress" : statuses[checkpoint.id];
            const content = (
              <>
                <span className="block text-xs font-semibold tracking-wide text-stone-500 uppercase">
                  Step {index + 1}
                </span>
                <span className="mt-1 block font-semibold">
                  {checkpoint.label}
                </span>
                <span className="mt-1 block text-sm">{status}</span>
              </>
            );
            const className = `block min-h-24 rounded-2xl border p-4 ${
              isCurrent
                ? "border-amber-700 bg-amber-50 text-stone-950"
                : "border-stone-200 bg-white text-stone-700"
            }`;

            return (
              <li key={checkpoint.id}>
                {status === "Not started" ? (
                  <div className={className}>{content}</div>
                ) : (
                  <Link
                    aria-current={isCurrent ? "step" : undefined}
                    className={`${className} hover:border-amber-700`}
                    href={`/projects/${projectId}/${checkpoint.id}`}
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {current === "overview" ? (
        <Link
          className="mt-5 inline-block font-semibold text-amber-800 underline underline-offset-4"
          href="/"
        >
          Back to your projects
        </Link>
      ) : (
        <Link
          className="mt-5 inline-block font-semibold text-amber-800 underline underline-offset-4"
          href={`/projects/${projectId}`}
        >
          Save and exit to project overview
        </Link>
      )}
    </header>
  );
}
