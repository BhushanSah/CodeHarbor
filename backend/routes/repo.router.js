const express=require("express");
const repoController=require("../controllers/repoController");

const repoRouter=express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/id/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepoForCurrUser);
repoRouter.put("/repo/update/:id", repoController.updateRepoById);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepoById);
repoRouter.patch("/repo/visibility/:id", repoController.updateRepoVisibility);
repoRouter.get("/repo/public", repoController.getPublicRepositories);
repoRouter.get("/repo/:id/files", repoController.listRepositoryFiles);
repoRouter.get("/repo/:id/file", repoController.getRepositoryFile);

module.exports=repoRouter;