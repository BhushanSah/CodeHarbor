const express=require("express");
const repoController=require("../controllers/repoController");

const repoRouter=express.Router();

repoRouter.post("/repo/createRepo", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/:userID", repoController.fetchRepoForCurrUser);
repoRouter.put("/repo/update/:ID", repoController.updateRepoById);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepoById);
repoRouter.patch("/repo/toggle/:ID", repoController.toggleRepoById);

module.exports=repoRouter;