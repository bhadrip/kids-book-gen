import { access, readFile } from "node:fs/promises";

const required = ["OPENAI_API_KEY"];
const localEnvironment = await readLocalEnvironment();
const missing = required.filter((name) => !localEnvironment[name]);

try {
  await access(".tool-versions");
  console.log("✓ Node version is pinned in .tool-versions");
} catch {
  console.error("✗ Missing .tool-versions");
  process.exitCode = 1;
}

if (missing.length === 0) {
  console.log("✓ Required local environment configuration is present");
} else {
  console.log(
    `! Missing ${missing.join(", ")}. Copy .env.example to .env.local and add a local key before generation.`,
  );
}

async function readLocalEnvironment() {
  try {
    const contents = await readFile(".env.local", "utf8");
    return Object.fromEntries(
      contents
        .split(/\r?\n/)
        .filter((line) => line.includes("="))
        .map((line) => {
          const separator = line.indexOf("=");
          return [
            line.slice(0, separator).trim(),
            line.slice(separator + 1).trim(),
          ];
        }),
    );
  } catch {
    return process.env;
  }
}
