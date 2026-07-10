const express = require("express");
const commentController = require("../controllers/commentController");

const commentRouter = express.Router();

commentRouter.post(
  "/comment/create/:issueId",
  commentController.createComment
);

commentRouter.get(
  "/comment/all/:issueId",
  commentController.getCommentsByIssueId
);

commentRouter.delete(
  "/comment/delete/:commentId",
  commentController.deleteCommentById
);

module.exports = commentRouter;