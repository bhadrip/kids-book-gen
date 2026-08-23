import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import {
  libraryCharacterIdSchema,
  libraryCharacterSchema,
  type LibraryCharacter,
} from "@/lib/characters/character-library";

const safeFilename = /^[a-z0-9][a-z0-9._-]{0,159}$/;

export class FileCharacterLibraryRepository {
  public constructor(private readonly root: string) {}

  public async list(): Promise<LibraryCharacter[]> {
    try {
      const entries = await readdir(this.root, { withFileTypes: true });
      const characters = await Promise.all(
        entries
          .filter((entry) => entry.isDirectory())
          .map((entry) => this.load(entry.name)),
      );
      return characters
        .filter((character) => character.status === "approved")
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  public async load(id: string): Promise<LibraryCharacter> {
    const characterId = libraryCharacterIdSchema.parse(id);
    const value = await readFile(
      join(this.characterDirectory(characterId), "character.json"),
      "utf8",
    );
    return libraryCharacterSchema.parse(JSON.parse(value));
  }

  public async save(
    character: LibraryCharacter,
    reference: Uint8Array,
  ): Promise<void> {
    const parsed = libraryCharacterSchema.parse(character);
    const directory = this.characterDirectory(parsed.id);
    await mkdir(directory, { recursive: true });
    await this.writeAtomically(
      join(directory, parsed.rendition.referenceAssetFilename),
      reference,
    );
    await this.writeAtomically(
      join(directory, "character.json"),
      `${JSON.stringify(parsed, null, 2)}\n`,
    );
  }

  public async readAsset(id: string, filename: string): Promise<Buffer> {
    const characterId = libraryCharacterIdSchema.parse(id);
    this.validateFilename(filename);
    return readFile(join(this.characterDirectory(characterId), filename));
  }

  private characterDirectory(id: string): string {
    const root = resolve(this.root);
    const directory = resolve(root, id);
    if (!directory.startsWith(`${root}/`))
      throw new Error("Character directory must stay inside the library.");
    return directory;
  }

  private validateFilename(filename: string): void {
    if (basename(filename) !== filename || !safeFilename.test(filename))
      throw new Error("Character asset filename must stay inside its folder.");
  }

  private async writeAtomically(
    path: string,
    value: string | Uint8Array,
  ): Promise<void> {
    const temporaryPath = `${path}.tmp`;
    await writeFile(temporaryPath, value);
    await rename(temporaryPath, path);
  }
}
