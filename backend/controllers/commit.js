const fs = require("fs").promises;
const path = require("path");
const { v4: uuid } = require("uuid");

async function commitRepo(argv) {
  const message = argv.message;

  const repoPath = path.resolve(process.cwd(), ".CodeHarbor");
  const stagingPath = path.join(repoPath, "staging");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const stagedItems = await fs.readdir(stagingPath);

    if (stagedItems.length === 0) {
      console.log("Nothing staged to commit.");
      return;
    }

    if (!message || typeof message !== "string") {
      console.log('Provide a commit message. Example: codeharbor commit -m "Initial commit"');
      return;
    }

    const commitId = uuid();
    const commitDir = path.join(commitsPath, commitId);

    await fs.mkdir(commitDir, { recursive: true });

    // Moves both files and folders.
    // For example, src/hello.js stays inside src/hello.js.
    for (const item of stagedItems) {
      await fs.rename(
        path.join(stagingPath, item),
        path.join(commitDir, item)
      );
    }

    const commitInfo = {
      commitId,
      message,
      date: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify(commitInfo, null, 2)
    );

    console.log(`Commit ${commitId} created: ${message}`);
  } catch (err) {
    console.error("Error creating commit:", err.message);
  }
}

module.exports = { commitRepo };