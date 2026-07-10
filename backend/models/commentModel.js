const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    issue: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
    },

    author: {
      type: String,
      default: "CodeHarbor user",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;