const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".CodeHarbor");
  const commitsPath = path.join(repoPath, "commits");
  const configPath = path.join(repoPath, "config.json");

  try {
    // Read the local CodeHarbor configuration.
    const configData = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configData);

    // Read the remote created by:
    // codeharbor remote add origin <repoId>
    const remoteName = config.currentRemote || "origin";
    const remote = config.remotes?.[remoteName];

    if (!remote?.repoId) {
      throw new Error(
        "No remote repository configured. Run `codeharbor remote add origin <repoId>` first."
      );
    }

    const prefix = `repos/${remote.repoId}/commits/`;

    let continuationToken;
    const allObjects = [];

    // Keep requesting S3 until every object is received.
    do {
      const data = await s3
        .listObjectsV2({
          Bucket: config.bucket || S3_BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
        .promise();

      allObjects.push(...(data.Contents || []));

      continuationToken = data.IsTruncated
        ? data.NextContinuationToken
        : undefined;
    } while (continuationToken);

    if (allObjects.length === 0) {
      console.log("No commits found for this repository in S3.");
      return;
    }

    for (const object of allObjects) {
      const key = object.Key;

      // Skip S3 folder placeholders.
      if (!key || key.endsWith("/")) {
        continue;
      }

      // Example:
      // repos/<repoId>/commits/<commitId>/README.md
      const relativeKey = key.replace(prefix, "");

      const keyParts = relativeKey.split("/");
      const commitId = keyParts.shift();
      const fileName = keyParts.join("/");

      if (!commitId || !fileName) {
        continue;
      }

      const commitDir = path.join(commitsPath, commitId);
      const localFilePath = path.join(commitDir, fileName);

      // Create commit folder and nested file folders if needed.
      await fs.mkdir(path.dirname(localFilePath), {
        recursive: true,
      });

      const fileContent = await s3
        .getObject({
          Bucket: config.bucket || S3_BUCKET,
          Key: key,
        })
        .promise();

      await fs.writeFile(localFilePath, fileContent.Body);

      console.log(`Pulled: ${commitId}/${fileName}`);
    }

    console.log("All commits pulled from S3 successfully.");
  } catch (err) {
    console.error("Error while pulling:", err.message);
  }
}

module.exports = { pullRepo };