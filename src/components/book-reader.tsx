"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  BookLayoutStyle,
  BookSpread,
  type BookLayoutPage,
} from "@/components/book-spread";

export function BookReader({
  pages,
  projectId,
  projectTitle,
}: {
  pages: BookLayoutPage[];
  projectId: string;
  projectTitle: string;
}) {
  const [index, setIndex] = useState(0);
  const page = pages[index];

  useEffect(() => {
    function navigate(event: KeyboardEvent) {
      if (event.key === "ArrowLeft")
        setIndex((current) => Math.max(0, current - 1));
      if (event.key === "ArrowRight")
        setIndex((current) => Math.min(pages.length - 1, current + 1));
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(pages.length - 1);
    }
    window.addEventListener("keydown", navigate);
    return () => window.removeEventListener("keydown", navigate);
  }, [pages.length]);

  function goTo(nextIndex: number) {
    setIndex(nextIndex);
  }

  if (!page) return null;

  return (
    <section
      aria-labelledby="reader-heading"
      className="flex min-h-screen flex-col bg-stone-950 text-white"
    >
      <BookLayoutStyle />
      <header className="flex flex-col gap-3 border-b border-white/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-amber-300 uppercase">
            Fullscreen family reader
          </p>
          <h1
            className="mt-1 text-xl font-semibold outline-none"
            id="reader-heading"
          >
            {projectTitle}
          </h1>
        </div>
        <nav
          aria-label="Reader exits"
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            className="font-semibold text-amber-200 underline underline-offset-4"
            href={`/projects/${projectId}`}
          >
            Save and exit to project overview
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-xl border border-white/50 px-4 py-2 font-semibold"
            href={`/projects/${projectId}/book`}
          >
            Close reader and review pages
          </Link>
        </nav>
      </header>

      <div className="flex flex-1 items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl sm:rounded-3xl">
          <BookSpread page={page} />
        </div>
      </div>

      <footer className="border-t border-white/15 px-4 py-4 sm:px-7">
        <p aria-live="polite" className="text-center text-sm text-stone-300">
          Page {index + 1} of {pages.length}: {page.title}
        </p>
        <div className="mx-auto mt-3 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            className="min-h-12 rounded-xl border border-white/50 px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
            type="button"
          >
            Previous page
          </button>
          <span className="hidden self-center text-center text-sm text-stone-400 sm:block">
            Arrow keys also turn pages
          </span>
          {index < pages.length - 1 ? (
            <button
              className="min-h-12 rounded-xl bg-amber-300 px-4 font-semibold text-stone-950"
              onClick={() => goTo(index + 1)}
              type="button"
            >
              Next page
            </button>
          ) : (
            <button
              className="min-h-12 rounded-xl bg-amber-300 px-4 font-semibold text-stone-950"
              onClick={() => {
                const reduceMotion = window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches;
                document.getElementById("reading-feedback")?.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                });
              }}
              type="button"
            >
              Finish and share feedback
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
