import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  createProject,
  projectIdSchema,
  projectSchema,
  type CreateProjectInput,
  type Project,
  type ProjectDependencies,
} from "@/lib/projects/project";

const projectFilename = "project.json";

export class FileProjectRepository {
  public constructor(
    private readonly projectRoot: string,
    private readonly dependencies: ProjectDependencies,
  ) {}

  public async create(input: CreateProjectInput): Promise<Project> {
    const project = createProject(input, this.dependencies);
    const directory = this.projectDirectory(project.id);

    await mkdir(directory, { recursive: true });
    await this.writeJsonAtomically(join(directory, projectFilename), project);

    return project;
  }

  public async load(id: string): Promise<Project> {
    const projectId = projectIdSchema.parse(id);
    const content = await readFile(
      join(this.projectDirectory(projectId), projectFilename),
      "utf8",
    );

    return projectSchema.parse(JSON.parse(content));
  }

  public async list(): Promise<Project[]> {
    try {
      const entries = await readdir(this.projectRoot, { withFileTypes: true });
      const projects = await Promise.all(
        entries
          .filter((entry) => entry.isDirectory())
          .map((entry) => this.load(entry.name)),
      );

      return projects.sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private projectDirectory(id: string): string {
    const root = resolve(this.projectRoot);
    const directory = resolve(root, id);

    if (!directory.startsWith(`${root}/`)) {
      throw new Error("Project directory must be inside the configured root.");
    }

    return directory;
  }

  private async writeJsonAtomically(
    path: string,
    value: unknown,
  ): Promise<void> {
    const temporaryPath = `${path}.tmp`;
    await writeFile(
      temporaryPath,
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryPath, path);
  }
}
