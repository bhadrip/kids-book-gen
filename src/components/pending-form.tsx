"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type PendingFormProps = {
  action: string;
  children: ReactNode;
  className?: string;
  submitClassName: string;
  submitLabel: string;
  pendingLabel: string;
  pendingMessage: string;
};

export function PendingForm({
  action,
  children,
  className,
  submitClassName,
  submitLabel,
  pendingLabel,
  pendingMessage,
}: PendingFormProps) {
  const [pending, setPending] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const statusId = useId();
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (submissionError) errorRef.current?.focus();
  }, [submissionError]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSubmissionError(null);
    window.dispatchEvent(new Event("storytime:form-pending"));

    try {
      const response = await fetch(action, {
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as {
        message?: unknown;
        redirectTo?: unknown;
      } | null;
      if (!response.ok) {
        throw new Error(
          typeof body?.message === "string"
            ? body.message
            : "We could not save that yet. Check your entries and try again.",
        );
      }
      if (typeof body?.redirectTo !== "string") {
        throw new Error("The action was saved, but its next page was missing.");
      }
      window.location.assign(new URL(body.redirectTo, window.location.href));
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not save that yet. Check your entries and try again.",
      );
      setPending(false);
      window.dispatchEvent(new Event("storytime:form-settled"));
    }
  }

  return (
    <form
      action={action}
      aria-busy={pending}
      className={className}
      method="post"
      onSubmit={(event) => void submit(event)}
    >
      <fieldset aria-disabled={pending} className="min-w-0 border-0 p-0">
        {children}
        <button
          aria-describedby={statusId}
          className={`${submitClassName} inline-flex min-h-11 items-center gap-2 disabled:cursor-wait disabled:opacity-70`}
          type="submit"
        >
          {pending ? (
            <span
              aria-hidden="true"
              className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
            />
          ) : null}
          {pending ? pendingLabel : submitLabel}
        </button>
      </fieldset>
      <p
        className={pending ? "mt-3 text-sm text-stone-700" : "sr-only"}
        id={statusId}
        role="status"
      >
        {pending ? pendingMessage : ""}
      </p>
      {submissionError ? (
        <p
          className="mt-3 rounded-xl bg-red-50 p-4 text-red-800 outline-none focus:ring-2 focus:ring-red-700"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          {submissionError}
        </p>
      ) : null}
    </form>
  );
}
