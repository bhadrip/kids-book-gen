"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProductionLiveStatus({
  active,
  completed,
  recentlyUpdated,
  status,
}: {
  active: boolean;
  completed: number;
  recentlyUpdated: boolean;
  status: "in_progress" | "paused" | "completed" | "failed";
}) {
  const router = useRouter();

  useEffect(() => {
    if (status !== "in_progress") return;
    const refresh = window.setInterval(() => router.refresh(), 5_000);
    return () => window.clearInterval(refresh);
  }, [router, status]);

  if (status !== "in_progress") return null;

  return active ? (
    <div
      className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-950/60 p-4 text-sm leading-6 text-emerald-50"
      role="status"
    >
      <p className="font-semibold">Generation is active in this app.</p>
      <p className="mt-1">
        This screen refreshes every 5 seconds. One image may take several
        minutes; the saved count advances only after that page is safely
        written.
      </p>
    </div>
  ) : recentlyUpdated ? (
    <div
      className="mt-5 rounded-2xl border border-amber-300/50 bg-amber-950/70 p-4 text-sm leading-6 text-amber-50"
      role="status"
    >
      <p className="font-semibold">Waiting for the current page result.</p>
      <p className="mt-1">
        The saved job changed recently, but this app instance cannot confirm the
        original request. To prevent a duplicate paid request, resume unlocks if
        no update arrives for four minutes.
      </p>
    </div>
  ) : (
    <div
      className="mt-5 rounded-2xl border border-amber-300/50 bg-amber-950/70 p-4 text-sm leading-6 text-amber-50"
      role="alert"
    >
      <p className="font-semibold">
        No active generation request was detected.
      </p>
      <p className="mt-1">
        The earlier run was interrupted or the app restarted. {completed} of 16
        pages are safe; resume below from the first missing page.
      </p>
    </div>
  );
}
