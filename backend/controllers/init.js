const fs = require("fs").promises;
const path = require("path");

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".CodeHarbor");
  const commitsPath = path.join(repoPath, "commits");
  const stagingPath = path.join(repoPath, "staging");
  const configPath = path.join(repoPath, "config.json");

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });

    try {
      await fs.access(configPath);

      console.log("CodeHarbor repository already initialized.");
      return;
    } catch {
      // config.json does not exist yet, so create it below.
    }

    const config = {
      bucket: process.env.S3_BUCKET || "bhushansah",
      remotes: {},
      currentRemote: null,
    };

    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2)
    );

    console.log("Repository initialized!");
  } catch (err) {
    console.error("Error initializing repository:", err.message);
  }
}

module.exports = { initRepo };