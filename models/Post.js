const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      content: { type: String, required: true, trim: true, maxlength: 500 },
      createdAt: { type: Date, default: Date.now },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
  ],
  images: [{ url: String, caption: String }],
  tags: [String],
  visibility: { type: String, enum: ["public", "private", "friends"], default: "public" },
  isEdited: { type: Boolean, default: false },
  editHistory: [
    {
      content: String,
      editedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
