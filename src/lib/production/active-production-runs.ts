type ActiveProductionRun = {
  startedAt: string;
};

const globalRuns = globalThis as typeof globalThis & {
  kidsBookActiveProductionRuns?: Map<string, ActiveProductionRun>;
};

function runs(): Map<string, ActiveProductionRun> {
  globalRuns.kidsBookActiveProductionRuns ??= new Map();
  return globalRuns.kidsBookActiveProductionRuns;
}

export function claimActiveProductionRun(
  projectId: string,
  startedAt: string,
): boolean {
  if (runs().has(projectId)) return false;
  runs().set(projectId, { startedAt });
  return true;
}

export function releaseActiveProductionRun(projectId: string): void {
  runs().delete(projectId);
}

export function getActiveProductionRun(
  projectId: string,
): ActiveProductionRun | null {
  return runs().get(projectId) ?? null;
}
