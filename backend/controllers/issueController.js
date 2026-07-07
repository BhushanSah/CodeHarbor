const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

const createIssue = async (req, res) => {
  const { title, description } = req.body;
  const repoID = req.params.repositoryId;

  try {
    if (!title?.trim()) {
      return res.status(400).json({
        error: "Issue title is required!",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        error: "Issue description is required!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(repoID)) {
      return res.status(400).json({
        error: "Invalid repository ID!",
      });
    }

    const repository = await Repository.findById(repoID);

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!",
      });
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      repository: repoID,
    });

    // Keeps repository.issues updated for the issue count.
    if (Array.isArray(repository.issues)) {
      repository.issues.push(issue._id);
      await repository.save();
    }

    return res.status(201).json({
      message: "Issue created!",
      issue,
    });
  } catch (err) {
    console.error("Error during issue creation:", err.message);

    return res.status(500).json({
      error: "Server error while creating issue.",
    });
  }
};

const updateIssueById = async (req, res) => {
  const id = req.params.id;
  const { title, description, status } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid issue ID!",
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          error: "Issue title cannot be empty!",
        });
      }

      issue.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          error: "Issue description cannot be empty!",
        });
      }

      issue.description = description.trim();
    }

    if (status !== undefined) {
      if (!["open", "closed"].includes(status)) {
        return res.status(400).json({
          error: "Status must be open or closed!",
        });
      }

      issue.status = status;
    }

    const updatedIssue = await issue.save();

    return res.status(200).json({
      message: "Issue updated!",
      issue: updatedIssue,
    });
  } catch (err) {
    console.error("Error during issue update:", err.message);

    return res.status(500).json({
      error: "Server error while updating issue.",
    });
  }
};

const deleteIssueById = async (req, res) => {
  const id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid issue ID!",
      });
    }

    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!",
      });
    }

    await Repository.findByIdAndUpdate(issue.repository, {
      $pull: {
        issues: issue._id,
      },
    });

    return res.status(200).json({
      message: "Issue deleted!",
      issue,
    });
  } catch (err) {
    console.error("Error during issue deletion:", err.message);

    return res.status(500).json({
      error: "Server error while deleting issue.",
    });
  }
};

const getAllIssues = async (req, res) => {
  const repoId = req.params.repoId;

  try {
    if (!mongoose.Types.ObjectId.isValid(repoId)) {
      return res.status(400).json({
        error: "Invalid repository ID!",
      });
    }

    const repository = await Repository.findById(repoId);

    if (!repository) {
      return res.status(404).json({
        error: "Repository not found!",
      });
    }

    const issues = await Issue.find({
      repository: repoId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      issues,
    });
  } catch (err) {
    console.error("Error during issue fetch:", err.message);

    return res.status(500).json({
      error: "Server error while fetching issues.",
    });
  }
};

const getIssueById = async (req, res) => {
  const id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid issue ID!",
      });
    }

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found!",
      });
    }

    return res.status(200).json(issue);
  } catch (err) {
    console.error("Error getting issue:", err.message);

    return res.status(500).json({
      error: "Server error while getting issue.",
    });
  }
};

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};