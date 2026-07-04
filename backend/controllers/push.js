const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".CodeHarbor");
  const commitsPath = path.join(repoPath, "commits");
  const configPath = path.join(repoPath, "config.json");

  try {
    // Read the local CodeHarbor configuration.
    const configData = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configData);

    // Get the remote saved by:
    // codeharbor remote add origin <repoId>
    const remoteName = config.currentRemote || "origin";
    const remote = config.remotes?.[remoteName];

    if (!remote?.repoId) {
      throw new Error(
        "No remote repository configured. Run `codeharbor remote add origin <repoId>` first."
      );
    }

    const commitDirs = await fs.readdir(commitsPath);

    for (const commitId of commitDirs) {
      const commitPath = path.join(commitsPath, commitId);

      const commitStat = await fs.stat(commitPath);

      // Skip anything inside commits that is not a folder.
      if (!commitStat.isDirectory()) {
        continue;
      }

      const files = await fs.readdir(commitPath);

      for (const fileName of files) {
        const filePath = path.join(commitPath, fileName);

        const fileStat = await fs.stat(filePath);

        // Skip nested folders for now.
        if (fileStat.isDirectory()) {
          continue;
        }

        const fileContent = await fs.readFile(filePath);

        const params = {
          Bucket: config.bucket || S3_BUCKET,
          Key: `repos/${remote.repoId}/commits/${commitId}/${fileName}`,
          Body: fileContent,
        };

        await s3.upload(params).promise();

        console.log(`Uploaded: ${fileName}`);
      }
    }

    console.log("All commits pushed to S3 successfully.");
  } catch (err) {
    console.error("Error pushing to S3:", err.message);
  }
}

module.exports = { pushRepo };