import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, parse, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const releaseSource = join(projectRoot, "dist", "client");
const defaultDestination = "/Users/forzen/academy/vectorsaur-live/node";
const destination = resolve(process.argv[2] ?? defaultDestination);
const releaseMarkerName = ".factorinode-release";
const releaseMarker = join(destination, releaseMarkerName);
const generatedAssetPath = "/node/_next/";
const publishedAssetPath = "/node/assets/";

const rewritePublishedAssetPaths = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      rewritePublishedAssetPaths(entryPath);
      continue;
    }
    if (!entry.isFile()) continue;
    const contents = readFileSync(entryPath, "utf8");
    if (contents.includes(generatedAssetPath)) {
      writeFileSync(entryPath, contents.replaceAll(generatedAssetPath, publishedAssetPath));
    }
  }
};

if (!isAbsolute(destination) || destination === parse(destination).root) {
  throw new Error(`Refusing unsafe release destination: ${destination}`);
}

if (existsSync(destination) && !existsSync(releaseMarker)) {
  throw new Error(
    `Refusing to replace ${destination} because it was not created by this release script.`,
  );
}

console.log("Building FACTORINODE static release for /node ...");
const build = spawnSync("npm", ["run", "build"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    FACTORINODE_STATIC_RELEASE: "1",
    FACTORINODE_RELEASE_BASE_PATH: "/node",
  },
  stdio: "inherit",
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

const indexPath = join(releaseSource, "index.html");
if (!existsSync(indexPath)) {
  throw new Error(`Static export did not create ${indexPath}`);
}

const indexHtml = readFileSync(indexPath, "utf8");
if (!indexHtml.includes("/node/_next/")) {
  throw new Error("Static export is missing the expected /node asset path.");
}

const destinationParent = dirname(destination);
mkdirSync(destinationParent, { recursive: true });
const stagingDirectory = mkdtempSync(join(destinationParent, ".factorinode-release-"));

try {
  cpSync(releaseSource, stagingDirectory, { recursive: true });
  const prefixedAssets = join(stagingDirectory, "node");
  if (existsSync(prefixedAssets)) {
    for (const entry of readdirSync(prefixedAssets)) {
      cpSync(join(prefixedAssets, entry), join(stagingDirectory, entry), {
        recursive: true,
        force: true,
      });
    }
    rmSync(prefixedAssets, { recursive: true });
  }
  const generatedAssets = join(stagingDirectory, "_next");
  const publishedAssets = join(stagingDirectory, "assets");
  if (!existsSync(generatedAssets)) {
    throw new Error("Static export is missing its generated asset directory.");
  }
  renameSync(generatedAssets, publishedAssets);
  rewritePublishedAssetPaths(stagingDirectory);
  const publishedIndex = readFileSync(join(stagingDirectory, "index.html"), "utf8");
  if (
    publishedIndex.includes(generatedAssetPath) ||
    !publishedIndex.includes(publishedAssetPath)
  ) {
    throw new Error("GitHub Pages asset paths were not rewritten correctly.");
  }
  const publishedReferences = [
    ...publishedIndex.matchAll(/(?:src|href)="(\/node\/[^"?#]+)/g),
  ].map((match) => match[1]);
  const missingReferences = [...new Set(publishedReferences)].filter(
    (reference) =>
      !existsSync(join(stagingDirectory, reference.slice("/node/".length))),
  );
  if (missingReferences.length > 0) {
    throw new Error(`Release contains missing assets:\n${missingReferences.join("\n")}`);
  }
  writeFileSync(join(stagingDirectory, ".nojekyll"), "");
  writeFileSync(
    join(stagingDirectory, releaseMarkerName),
    `${JSON.stringify({ app: "FACTORINODE", basePath: "/node", assets: "assets" }, null, 2)}\n`,
  );

  if (existsSync(destination)) rmSync(destination, { recursive: true });
  renameSync(stagingDirectory, destination);
} catch (error) {
  rmSync(stagingDirectory, { recursive: true, force: true });
  throw error;
}

console.log(`Release ready: ${destination}`);
