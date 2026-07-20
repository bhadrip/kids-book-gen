import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FileProjectRepository } from "@/lib/projects/file-project-repository";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

async function createRepository() {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-projects-"));
  directories.push(directory);
  return new FileProjectRepository(directory, {
    now: () => new Date("2026-07-20T12:00:00.000Z"),
    createId: () => "4a2b8437-2e5d-492d-885b-4f1052d4da88",
  });
}

describe("FileProjectRepository", () => {
  it("creates a versioned project that can be loaded after a new repository instance", async () => {
    const repository = await createRepository();
    const created = await repository.create({
      title: "Milo and the Moon Kite",
    });
    const resumed = await repository.load(created.id);

    expect(resumed).toEqual(created);
  });

  it("writes complete JSON to the project folder", async () => {
    const repository = await createRepository();
    const project = await repository.create({ title: "A Small Brave Boat" });
    const content = await readFile(
      join(directories[0], project.id, "project.json"),
      "utf8",
    );

    expect(JSON.parse(content)).toEqual(project);
    expect(content.endsWith("\n")).toBe(true);
  });

  it("lists saved projects", async () => {
    const repository = await createRepository();
    const project = await repository.create({ title: "A saved family story" });

    await expect(repository.list()).resolves.toEqual([project]);
  });

  it("rejects malformed persisted project data", async () => {
    const repository = await createRepository();
    const project = await repository.create({ title: "A Lantern Adventure" });
    await writeFile(
      join(directories[0], project.id, "project.json"),
      "{ not json",
      "utf8",
    );

    await expect(repository.load(project.id)).rejects.toThrow();
  });
});
