import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { libraryCharacterSchema } from "@/lib/characters/character-library";
import { FileCharacterLibraryRepository } from "@/lib/characters/file-character-library-repository";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

describe("FileCharacterLibraryRepository", () => {
  it("atomically saves, lists, and reads a validated local character", async () => {
    const directory = await mkdtemp(join(tmpdir(), "character-library-"));
    directories.push(directory);
    const repository = new FileCharacterLibraryRepository(directory);
    const character = libraryCharacterSchema.parse({
      schemaVersion: 1,
      id: "f4429be0-325f-48c9-8130-2e1ea761dd7f",
      revision: 1,
      displayName: "Maya",
      status: "approved",
      visibility: "private",
      identity: {
        description: "A curious child with red glasses.",
        identityInvariants: ["Keep red glasses.", "Keep curly hair."],
        avoid: ["words inside artwork"],
      },
      rendition: {
        presetId: "warm_handmade_v1",
        referenceAssetFilename: "reference.png",
        model: "fixture-image-v1",
      },
      origin: {
        projectId: "4a2b8437-2e5d-492d-885b-4f1052d4da88",
        storyRevision: 1,
        characterDesignRevision: 1,
        optionId: "character-1",
      },
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
    });

    await repository.save(character, new Uint8Array([1, 2, 3]));

    await expect(repository.list()).resolves.toEqual([character]);
    await expect(
      repository.readAsset(character.id, "reference.png"),
    ).resolves.toEqual(Buffer.from([1, 2, 3]));
    await expect(
      repository.readAsset(character.id, "../reference.png"),
    ).rejects.toThrow();
  });
});
