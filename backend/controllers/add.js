const fs = require("fs").promises;
const path = require("path");

const ignoredFolders = new Set([
  ".CodeHarbor",
  ".git",
  "node_modules",
]);

async function stagePath(sourcePath, projectPath, stagingPath) {
  const stats = await fs.stat(sourcePath);

  if (stats.isDirectory()) {
    if (ignoredFolders.has(path.basename(sourcePath))) {
      return 0;
    }

    const entries = await fs.readdir(sourcePath);
    let stagedCount = 0;

    for (const entry of entries) {
      stagedCount += await stagePath(
        path.join(sourcePath, entry),
        projectPath,
        stagingPath
      );
    }

    return stagedCount;
  }

  if (!stats.isFile()) {
    return 0;
  }

  const relativePath = path.relative(projectPath, sourcePath);

  const destinationPath = path.join(stagingPath, relativePath);

  await fs.mkdir(path.dirname(destinationPath), {
    recursive: true,
  });

  await fs.copyFile(sourcePath, destinationPath);

  console.log(`Staged: ${relativePath}`);

  return 1;
}

async function addRepo(argv) {
  const target = argv.file;

  if (!target || typeof target !== "string") {
    console.error("Provide a file or folder. Example: codeharbor add README.md");
    return;
  }

  const projectPath = process.cwd();
  const repoPath = path.join(projectPath, ".CodeHarbor");
  const stagingPath = path.join(repoPath, "staging");
  const sourcePath = path.resolve(projectPath, target);

  try {
    await fs.access(repoPath);
  } catch {
    console.error(
      "This folder is not a CodeHarbor repository. Run `codeharbor init` first."
    );
    return;
  }

  const relativeToProject = path.relative(projectPath, sourcePath);

  if (
    relativeToProject.startsWith("..") ||
    path.isAbsolute(relativeToProject)
  ) {
    console.error("You can only add files inside the current project folder.");
    return;
  }

  try {
    const stagedCount = await stagePath(
      sourcePath,
      projectPath,
      stagingPath
    );

    if (stagedCount === 0) {
      console.log("No files were staged.");
      return;
    }

    console.log(
      `${stagedCount} file${stagedCount === 1 ? "" : "s"} staged successfully.`
    );
  } catch (err) {
    console.error("Error adding file:", err.message);
  }
}

module.exports = { addRepo };