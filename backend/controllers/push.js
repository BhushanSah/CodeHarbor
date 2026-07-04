const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function getAllFiles(folderPath) {
  const entries = await fs.readdir(folderPath, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await getAllFiles(fullPath);
      files.push(...nestedFiles);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".CodeHarbor");
  const commitsPath = path.join(repoPath, "commits");
  const configPath = path.join(repoPath, "config.json");

  try {
    const configData = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configData);

    const remoteName = config.currentRemote || "origin";
    const remote = config.remotes?.[remoteName];

    if (!remote?.repoId) {
      throw new Error(
        "No remote repository configured. Run `codeharbor remote add origin <repoId>` first."
      );
    }

    const commitDirs = await fs.readdir(commitsPath);

    if (commitDirs.length === 0) {
      console.log("No local commits to push.");
      return;
    }

    for (const commitId of commitDirs) {
      const commitPath = path.join(commitsPath, commitId);
      const commitStat = await fs.stat(commitPath);

      if (!commitStat.isDirectory()) {
        continue;
      }

      const commitFiles = await getAllFiles(commitPath);

      for (const localFilePath of commitFiles) {
        const relativePath = path.relative(commitPath, localFilePath);

        // S3 keys should always use forward slashes, even on Windows.
        const s3FilePath = relativePath.split(path.sep).join("/");

        const fileContent = await fs.readFile(localFilePath);

        const params = {
          Bucket: config.bucket || S3_BUCKET,
          Key: `repos/${remote.repoId}/commits/${commitId}/${s3FilePath}`,
          Body: fileContent,
        };

        await s3.upload(params).promise();

        console.log(`Uploaded: ${commitId}/${s3FilePath}`);
      }
    }

    console.log("All commits pushed to S3 successfully.");
  } catch (err) {
    console.error("Error pushing to S3:", err.message);
  }
}

module.exports = { pushRepo };