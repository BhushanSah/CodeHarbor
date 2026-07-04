#!/usr/bin/env node

require("dotenv").config();

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { remoteCommand } = require("./controllers/remote");
const { revertRepo } = require("./controllers/revert");

yargs(hideBin(process.argv))
  .scriptName("codeharbor")
  .command(
    "init",
    "Create a CodeHarbor repository",
    () => {},
    initRepo
  )
  .command(
    "add <file>",
    "Stage a file",
    () => {},
    addRepo
  )
  .command(
    "commit",
    "Create a local commit",
    (yargsInstance) =>
      yargsInstance.option("message", {
        alias: "m",
        type: "string",
        demandOption: true,
        describe: "Commit message",
      }),
    commitRepo
  )
  .command(
    "remote add <name> <repoId>",
    "Connect this local folder to a CodeHarbor repository",
    () => {},
    remoteCommand
  )
  .command(
    "push",
    "Push local commits to S3",
    () => {},
    pushRepo
  )
  .command(
    "pull",
    "Pull commits from S3",
    () => {},
    pullRepo
  )
  .command(
    "revert <commitId>",
    "Restore a local commit snapshot",
    () => {},
    revertRepo
  )
  .demandCommand(1, "Choose a CodeHarbor command.")
  .help()
  .strict()
  .parse();