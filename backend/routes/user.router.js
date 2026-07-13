const express=require("express");
const userController=require("../controllers/userController");

const userRouter=express.Router();

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.get("/userActivity/:id", userController.getUserActivity);
userRouter.put("/updateProfile/:id", userController.updateUserProfile);
userRouter.delete("/deleteUserProfile/:id", userController.deleteUserProfile);

module.exports=userRouter;