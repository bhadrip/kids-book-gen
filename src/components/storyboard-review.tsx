"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { PendingForm } from "@/components/pending-form";
import type { BookPlanPage } from "@/lib/production/production-artifacts";

function textPosition(textSafeArea: BookPlanPage["textSafeArea"]): string {
  return {
    upper_left: "top-[7%] left-[5%]",
    upper_right: "top-[7%] right-[5%]",
    lower_left: "bottom-[7%] left-[5%]",
    lower_right: "right-[5%] bottom-[7%]",
  }[textSafeArea];
}

const bookFontSizes = [3, 2.75, 2.5, 2.25, 2] as const;

function FittedPageText({
  compact,
  onFitChange,
  page,
}: {
  compact: boolean;
  onFitChange?: (fits: boolean) => void;
  page: BookPlanPage;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const fitText = () => {
      const boxStyle = window.getComputedStyle(box);
      const availableHeight =
        box.clientHeight -
        Number.parseFloat(boxStyle.paddingTop) -
        Number.parseFloat(boxStyle.paddingBottom);
      let nextFits = false;
      for (const size of bookFontSizes) {
        text.style.fontSize = `${size}cqw`;
        if (text.getBoundingClientRect().height <= availableHeight + 0.5) {
          nextFits = true;
          break;
        }
      }
      setFits(nextFits);
      onFitChange?.(nextFits);
    };

    fitText();
    const observer = new ResizeObserver(fitText);
    observer.observe(box);
    return () => observer.disconnect();
  }, [onFitChange, page.pageId, page.text]);

  return (
    <div
      className={`absolute ${textPosition(page.textSafeArea)} h-[58%] w-[42%] overflow-hidden rounded-xl bg-[#fffdf7]/95 ${fits ? "" : "ring-2 ring-red-600"}`}
      ref={boxRef}
      style={{ padding: "3cqw" }}
    >
      <p
        className="whitespace-pre-line text-stone-950"
        ref={textRef}
        style={{ fontSize: `${bookFontSizes[0]}cqw`, lineHeight: 1.45 }}
      >
        {page.text}
      </p>
      {!fits && !compact ? (
        <span className="sr-only">This page’s words do not fit.</span>
      ) : null}
    </div>
  );
}

function StoryboardSketch({
  page,
  compact = false,
  onTextFitChange,
}: {
  page: BookPlanPage;
  compact?: boolean;
  onTextFitChange?: (fits: boolean) => void;
}) {
  const scene = page.storyboardScene;
  const sceneText = [
    scene?.mainAction,
    scene?.emotionalMovement,
    scene?.illustrationIntent,
    ...(scene?.mustShow ?? []),
    ...(scene?.characterExpressions.map((item) => item.outwardExpression) ??
      []),
    page.illustrationDescription,
    ...page.requiredReferenceDetails,
  ]
    .join(" ")
    .toLowerCase();
  const has = (...terms: string[]) =>
    terms.some((term) => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(
        sceneText,
      );
    });
  const textOnLeft = page.textSafeArea.endsWith("left");
  const textOnTop = page.textSafeArea.startsWith("upper");
  const characterX = textOnLeft ? 455 : 265;
  const facing = textOnLeft ? 1 : -1;
  const focusX = textOnLeft ? 600 : 120;
  const clipId = `storyboard-scene-${page.pageId}-${compact ? "thumbnail" : "reader"}`;
  const clearX = textOnLeft ? 28 : 382;
  const clearY = textOnTop ? 24 : 184;
  const clipPath = `M0 0H720V480H0Z M${clearX} ${clearY}H${clearX + 310}V${clearY + 272}H${clearX}Z`;
  const showsContainer = has(
    "container",
    "containers",
    "leftover",
    "leftovers",
    "storage",
    "label",
    "labeled",
  );
  const showsJourney =
    has("plant", "planting", "picking", "garden", "farm") &&
    has("cook", "cooking", "pot", "kitchen", "washing");
  const showsPlant =
    !showsContainer &&
    !showsJourney &&
    has("plant", "planting", "picking", "garden", "farm");
  const showsCooking =
    !showsContainer &&
    !showsJourney &&
    has("cook", "cooking", "pot", "kitchen");
  const showsMeal =
    !showsContainer &&
    !showsJourney &&
    !showsPlant &&
    !showsCooking &&
    has("table", "meal", "plate", "food", "portion", "serving", "bites");
  const reaching = has("reach", "catch", "point", "touch", "stretch");
  const running = has("run", "chase", "follow", "race", "hurry", "fly");
  const sitting = has("sit", "kneel", "crouch", "rest");
  const holding = has("hold", "carry", "hug", "grip", "clutch");
  const happy = has("smile", "happy", "joy", "delight", "satisfied", "proud");
  const worried = has("sad", "worry", "afraid", "fear", "upset", "frown");
  const actionDescription = scene?.mainAction ?? page.illustrationDescription;

  return (
    <div
      className={`[container-type:inline-size] relative aspect-[3/2] max-w-full min-w-0 overflow-hidden bg-stone-100 ${compact ? "min-h-44" : "min-h-[18rem] rounded-3xl sm:min-h-[28rem]"}`}
    >
      <svg
        aria-label={`Storyboard scene: ${actionDescription}`}
        className="absolute inset-0 h-full w-full text-stone-500"
        role="img"
        viewBox="0 0 720 480"
      >
        <defs>
          <clipPath id={clipId}>
            <path clipRule="evenodd" d={clipPath} fillRule="evenodd" />
          </clipPath>
        </defs>
        <g
          clipPath={`url(#${clipId})`}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        >
          <path d="M0 382 C140 340 238 408 360 372 C490 335 590 389 720 344" />
          <path
            d="M0 402 C140 365 245 427 370 393 C500 360 610 408 720 365"
            opacity="0.35"
          />
          {has("cloud", "sky", "storm", "rain") ? (
            <path
              d="M55 115 C80 82 126 88 141 118 C170 91 216 105 220 142 C252 139 274 165 263 190 L61 190 C35 176 34 135 55 115Z"
              opacity="0.35"
            />
          ) : null}
          {has("home", "house", "roof", "window", "bedroom") ? (
            <g opacity="0.55">
              <path d="M70 360 L70 245 L170 175 L270 245 L270 360" />
              <path d="M105 360 L105 290 L155 290 L155 360 M195 260 H238 V305 H195Z" />
            </g>
          ) : null}
          {has("tree", "forest", "woods", "garden") ? (
            <g opacity="0.55">
              <path d="M115 370 V245" />
              <path d="M115 255 C55 260 50 190 96 174 C94 124 171 119 177 174 C224 192 202 264 153 255Z" />
            </g>
          ) : null}
          {has("river", "water", "ocean", "pond", "sea") ? (
            <path
              d="M0 332 Q80 305 160 332 T320 332 T480 332 T640 332 T800 332"
              opacity="0.55"
            />
          ) : null}
          {showsMeal ? (
            <g opacity="0.72">
              <path d="M55 332 H665 M105 332 L88 430 M615 332 L632 430" />
              <ellipse cx={focusX} cy="313" rx="68" ry="23" />
              {has("bite", "food", "meal", "portion", "scoop") ? (
                <g>
                  <circle cx={focusX - 18} cy="307" r="9" />
                  <circle cx={focusX + 8} cy="312" r="7" />
                  <circle cx={focusX + 29} cy="305" r="6" />
                </g>
              ) : null}
              {has("fork") ? (
                <path
                  d={`M${focusX - 92} 287 L${focusX - 82} 328 M${focusX - 99} 286 l6 14 M${focusX - 90} 284 l4 14 M${focusX - 81} 282 l2 14`}
                />
              ) : null}
              {has("spoon", "scoop", "serving") ? (
                <path
                  d={`M${focusX + 92} 276 Q${focusX + 110} 285 ${focusX + 96} 300 L${focusX + 75} 332`}
                />
              ) : null}
            </g>
          ) : null}
          {showsContainer ? (
            <g opacity="0.72">
              <path
                d={`M${focusX - 55} 225 H${focusX + 55} L${focusX + 45} 305 H${focusX - 45}Z M${focusX - 64} 220 H${focusX + 64}`}
              />
              <path
                d={`M${focusX - 22} 252 H${focusX + 22} V278 H${focusX - 22}Z`}
              />
            </g>
          ) : null}
          {showsPlant ? (
            <g opacity="0.65">
              <path
                d={`M${focusX} 315 V205 M${focusX} 255 Q${focusX - 45} 215 ${focusX - 65} 255 Q${focusX - 30} 282 ${focusX} 255 M${focusX} 235 Q${focusX + 42} 195 ${focusX + 64} 235 Q${focusX + 32} 263 ${focusX} 235`}
              />
            </g>
          ) : null}
          {showsCooking ? (
            <g opacity="0.65">
              <path
                d={`M${focusX - 55} 265 H${focusX + 55} L${focusX + 42} 325 H${focusX - 42}Z M${focusX - 70} 265 H${focusX + 70}`}
              />
              <path
                d={`M${focusX - 25} 240 Q${focusX - 42} 215 ${focusX - 20} 195 M${focusX + 20} 240 Q${focusX + 2} 210 ${focusX + 25} 188`}
              />
            </g>
          ) : null}
          {showsJourney ? (
            <g opacity="0.68">
              <path
                d={`M${focusX - 72} 320 V245 M${focusX - 72} 275 Q${focusX - 105} 248 ${focusX - 120} 278 Q${focusX - 92} 297 ${focusX - 72} 275 M${focusX - 72} 263 Q${focusX - 42} 235 ${focusX - 26} 264 Q${focusX - 51} 285 ${focusX - 72} 263`}
              />
              <path
                d={`M${focusX + 18} 278 H${focusX + 112} L${focusX + 100} 327 H${focusX + 30}Z M${focusX + 5} 278 H${focusX + 125}`}
              />
              <path
                d={`M${focusX - 5} 230 Q${focusX + 8} 246 ${focusX - 5} 258 Q${focusX - 18} 246 ${focusX - 5} 230Z`}
              />
              <path
                d={`M${focusX - 18} 290 H${focusX + 2}`}
                strokeDasharray="4 7"
              />
            </g>
          ) : null}
          {has("think", "study", "consider", "wonder") ? (
            <g opacity="0.55">
              <circle cx={characterX + 58 * facing} cy="210" r="8" />
              <circle cx={characterX + 78 * facing} cy="190" r="12" />
              <path
                d={`M${characterX + 95 * facing} 170 C${characterX + 70 * facing} 130 ${characterX + 145 * facing} 105 ${characterX + 165 * facing} 143 C${characterX + 205 * facing} 140 ${characterX + 211 * facing} 195 ${characterX + 170 * facing} 202 H${characterX + 112 * facing} C${characterX + 78 * facing} 200 ${characterX + 70 * facing} 174 ${characterX + 95 * facing} 170Z`}
              />
            </g>
          ) : null}
          <g transform={`translate(${characterX} 0) scale(${facing} 1)`}>
            <circle cx="0" cy="267" r="42" />
            <circle cx="-17" cy="262" r="14" />
            <circle cx="17" cy="262" r="14" />
            <path
              d={`M-3 262 L3 262 ${happy ? "M-12 280 Q0 296 14 280" : worried ? "M-12 292 Q0 277 14 292" : "M-11 285 Q0 291 12 284"}`}
            />
            <path
              d={`M-29 237 Q0 210 30 236 M-16 309 L-30 ${sitting ? 350 : 382} M16 309 L40 ${sitting ? 350 : 380}`}
            />
            <path
              d={
                reaching
                  ? "M-12 320 L-55 290 M13 318 L76 244"
                  : holding
                    ? "M-12 320 L30 340 M13 318 L30 340"
                    : running
                      ? "M-12 320 L-62 290 M13 318 L65 350"
                      : "M-12 320 L-61 352 M13 318 L73 330"
              }
            />
            <path
              d={
                sitting
                  ? "M-30 350 L-72 372 M40 350 L82 372"
                  : running
                    ? "M-30 382 L-73 402 M40 380 L82 351"
                    : "M-30 382 L-52 410 M40 380 L65 405"
              }
            />
          </g>
          {has("kite") ? (
            <g>
              <path
                d={`M${focusX - 42} 105 L${focusX} 62 L${focusX + 42} 105 L${focusX} 148Z`}
              />
              <path
                d={`M${focusX} 145 C${focusX - 35} 180 ${characterX + 70 * facing} 205 ${characterX + 73 * facing} 254`}
                strokeDasharray="8 9"
              />
              <path d={`M${focusX - 8} 151 l-18 22 l29 2Z`} />
            </g>
          ) : null}
          {has("moon") ? (
            <path
              d={`M${focusX} 65 A48 48 0 1 0 ${focusX + 34} 143 A38 38 0 1 1 ${focusX} 65Z`}
            />
          ) : null}
          {has("star") ? (
            <path
              d={`M${focusX} 65 l13 28 l31 4 l-23 21 l7 31 l-28 -16 l-28 16 l7 -31 l-23 -21 l31 -4Z`}
            />
          ) : null}
          {has("book", "read", "library") ? (
            <path
              d={`M${focusX - 58} 120 Q${focusX - 25} 103 ${focusX} 125 Q${focusX + 25} 103 ${focusX + 58} 120 V185 Q${focusX + 25} 168 ${focusX} 190 Q${focusX - 25} 168 ${focusX - 58} 185Z M${focusX} 125 V190`}
            />
          ) : null}
          {has("ball") ? <circle cx={focusX} cy="125" r="43" /> : null}
          {has("dog", "cat", "pet") ? (
            <g transform={`translate(${focusX} 285)`}>
              <circle cx="0" cy="0" r="35" />
              <path d="M-28 -22 l-25 -22 l5 43 M28 -22 l25 -22 l-5 43 M-14 8 Q0 22 14 8 M0 35 V78 M0 55 l-35 25 M0 55 l35 25" />
            </g>
          ) : null}
          {has("family", "parent", "mother", "father") &&
          !showsMeal &&
          !showsContainer &&
          !showsJourney &&
          !showsPlant &&
          !showsCooking ? (
            <g opacity="0.48">
              <circle cx={textOnLeft ? 620 : 100} cy="270" r="29" />
              <path
                d={
                  textOnLeft
                    ? "M620 300 V370 M620 325 l-42 30 M620 325 l38 30"
                    : "M100 300 V370 M100 325 l-38 30 M100 325 l42 30"
                }
              />
            </g>
          ) : null}
          {running ? (
            <path
              d={`M${characterX - 90 * facing} 265 l-35 0 M${characterX - 82 * facing} 285 l-28 10`}
              opacity="0.45"
            />
          ) : null}
          <path d="M350 0 L350 480" opacity="0.14" />
        </g>
      </svg>
      <FittedPageText
        compact={compact}
        onFitChange={onTextFitChange}
        page={page}
      />
    </div>
  );
}

function PageEditor({
  page,
  projectId,
}: {
  page: BookPlanPage;
  projectId: string;
}) {
  const preservedDetails = page.requiredReferenceDetails.join("\n");
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      <details className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <summary className="cursor-pointer font-semibold text-stone-950">
          Change the words
        </summary>
        <PendingForm
          action={`/api/projects/${projectId}/book/plan/pages/${page.pageId}`}
          className="mt-4"
          pendingLabel="Saving the words…"
          pendingMessage="Your new words are being saved. The picture idea and every other page will stay the same."
          submitClassName="mt-4 w-full justify-center rounded-xl border border-stone-950 px-4 py-3 text-sm font-semibold text-stone-950"
          submitLabel="Save these words"
        >
          <label
            className="block text-sm font-semibold text-stone-950"
            htmlFor={`plan-text-${page.pageId}`}
          >
            Words on this page
          </label>
          <textarea
            className="mt-2 block min-h-28 w-full rounded-xl border border-stone-300 p-3 text-sm leading-6"
            defaultValue={page.text}
            id={`plan-text-${page.pageId}`}
            key={`text-${page.pageId}`}
            maxLength={3000}
            name="text"
            required
          />
          <input
            name="illustrationDescription"
            type="hidden"
            value={page.illustrationDescription}
          />
          <input
            name="requiredReferenceDetails"
            type="hidden"
            value={preservedDetails}
          />
        </PendingForm>
      </details>
      <details className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <summary className="cursor-pointer font-semibold text-stone-950">
          Change the picture
        </summary>
        <PendingForm
          action={`/api/projects/${projectId}/book/plan/pages/${page.pageId}`}
          className="mt-4"
          pendingLabel="Saving the picture idea…"
          pendingMessage="Your picture idea is being saved. The words and every other page will stay the same."
          submitClassName="mt-4 w-full justify-center rounded-xl border border-stone-950 px-4 py-3 text-sm font-semibold text-stone-950"
          submitLabel="Save this picture idea"
        >
          <label
            className="block text-sm font-semibold text-stone-950"
            htmlFor={`plan-art-${page.pageId}`}
          >
            What would you like to happen in this picture?
          </label>
          <textarea
            className="mt-2 block min-h-32 w-full rounded-xl border border-stone-300 p-3 text-sm leading-6"
            defaultValue={page.illustrationDescription}
            id={`plan-art-${page.pageId}`}
            key={`picture-${page.pageId}`}
            maxLength={2000}
            name="illustrationDescription"
            required
          />
          <p className="mt-3 text-xs leading-5 text-stone-600">
            We’ll keep these approved details:{" "}
            {page.requiredReferenceDetails.join(", ")}.
          </p>
          <input name="text" type="hidden" value={page.text} />
          <input
            name="requiredReferenceDetails"
            type="hidden"
            value={preservedDetails}
          />
        </PendingForm>
      </details>
    </div>
  );
}

export function StoryboardReview({
  pages,
  planEditable,
  projectId,
}: {
  pages: BookPlanPage[];
  planEditable: boolean;
  projectId: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTextFits, setSelectedTextFits] = useState(true);
  const selectedPage = pages[selectedIndex];

  function selectPage(index: number) {
    setSelectedTextFits(true);
    setSelectedIndex(index);
    window.setTimeout(
      () =>
        document
          .getElementById("storyboard-page-reader")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  }

  if (!selectedPage) return null;

  return (
    <>
      <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page, index) => (
          <li
            className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50"
            data-testid={`plan-card-${page.pageId}`}
            key={page.pageId}
          >
            <button
              aria-label={`Open page ${page.sequence} of 16: ${page.title}`}
              className="block w-full cursor-pointer text-left outline-offset-4"
              onClick={() => selectPage(index)}
              type="button"
            >
              <StoryboardSketch compact page={page} />
            </button>
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="storyboard-reader-heading"
        className="mt-6 max-w-full min-w-0 scroll-mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
        id="storyboard-page-reader"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3
              className="text-xl font-semibold text-stone-950"
              id="storyboard-reader-heading"
            >
              Open one page at a time
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Page {selectedPage.sequence} of 16 · {selectedPage.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-stone-300 px-4 py-2 font-semibold text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={selectedIndex === 0}
              onClick={() => setSelectedIndex((index) => index - 1)}
              type="button"
            >
              Previous page
            </button>
            <button
              className="rounded-xl bg-stone-950 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={selectedIndex === pages.length - 1}
              onClick={() => setSelectedIndex((index) => index + 1)}
              type="button"
            >
              Next page
            </button>
          </div>
        </div>
        <article
          className="mt-5 max-w-full min-w-0 overflow-hidden"
          data-testid="plan-reader-page"
        >
          <StoryboardSketch
            onTextFitChange={setSelectedTextFits}
            page={selectedPage}
          />
        </article>
        {!selectedTextFits ? (
          <div
            className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-950"
            role="alert"
          >
            <p className="font-semibold">These words don’t fit comfortably.</p>
            <p className="mt-1 text-sm leading-6">
              Shorten the text before continuing. The storyboard will never hide
              or cut off words.
            </p>
          </div>
        ) : null}
        {planEditable ? (
          <PageEditor
            key={selectedPage.pageId}
            page={selectedPage}
            projectId={projectId}
          />
        ) : null}
      </section>
    </>
  );
}
