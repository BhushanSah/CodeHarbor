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
repoRouter.patch("/repo/toggle/:id", repoController.toggleRepoById);

module.exports=repoRouter;