const mongoose = require("mongoose");
const Issue = require("../models/issueModel");
const Comment = require("../models/commentModel");

const createComment = async (req, res) => {
  const issueId = req.params.issueId;
  const { body, author } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({
        error: "Invalid issue ID!",
      });
    }

    if (!body?.trim()) {
      return res.status(400).json({
        error: "Comment cannot be empty!",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!",
      });
    }

    const comment = await Comment.create({
      body: body.trim(),
      issue: issueId,
      repository: issue.repository,
      author: author?.trim() || "CodeHarbor user",
    });

    return res.status(201).json({
      message: "Comment created!",
      comment,
    });
  } catch (err) {
    console.error("Error during comment creation:", err.message);

    return res.status(500).json({
      error: "Server error while creating comment.",
    });
  }
};

const getCommentsByIssueId = async (req, res) => {
  const issueId = req.params.issueId;

  try {
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
      return res.status(400).json({
        error: "Invalid issue ID!",
      });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!",
      });
    }

    const comments = await Comment.find({
      issue: issueId,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      comments,
    });
  } catch (err) {
    console.error("Error during comments fetch:", err.message);

    return res.status(500).json({
      error: "Server error while fetching comments.",
    });
  }
};

const deleteCommentById = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        error: "Invalid comment ID!",
      });
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found!",
      });
    }

    return res.status(200).json({
      message: "Comment deleted!",
      comment,
    });
  } catch (err) {
    console.error("Error during comment deletion:", err.message);

    return res.status(500).json({
      error: "Server error while deleting comment.",
    });
  }
};

module.exports = {
  createComment,
  getCommentsByIssueId,
  deleteCommentById,
};