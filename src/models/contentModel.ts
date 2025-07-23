import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: { type: String },
    type: { type: String, required: true },
    link: { type: String },
    content: { type: String },
    imageUrl: { type: String },
    tag: [{ type: String }],
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }
  },
  { timestamps: true }
);

export const contentModel = mongoose.model("Content", contentSchema);
