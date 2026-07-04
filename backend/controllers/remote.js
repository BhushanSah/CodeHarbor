const fs = require("fs").promises;
const path = require("path");

const remoteCommand = async (argv) => {
  const { name, repoId, apiUrl, force } = argv;

  const codeHarborPath = path.join(process.cwd(), ".CodeHarbor");
  const configPath = path.join(codeHarborPath, "config.json");

  try {
    await fs.access(codeHarborPath);
  } catch {
    console.error(
      "This folder is not a CodeHarbor repository. Run `codeharbor init` first."
    );
    return;
  }

  try {
    let config = {};

    try {
      const configData = await fs.readFile(configPath, "utf8");
      config = configData.trim() ? JSON.parse(configData) : {};
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }

    if (config.remotes?.[name] && !force) {
      console.error(
        `Remote "${name}" already exists. Use --force if you want to replace it.`
      );
      return;
    }

    const remoteUrl =
      apiUrl ||
      process.env.CODEHARBOR_API_URL ||
      "http://localhost:3000";

    config.remotes = {
      ...(config.remotes || {}),
      [name]: {
        repoId,
        apiBaseUrl: remoteUrl,
        branch: "main",
      },
    };

    config.currentRemote = name;

    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2)
    );

    console.log(`Remote "${name}" added successfully.`);
    console.log(`Repository ID: ${repoId}`);
    console.log(`API URL: ${remoteUrl}`);
  } catch (err) {
    console.error("Could not add remote:", err.message);
  }
};

module.exports = { remoteCommand };