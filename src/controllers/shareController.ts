import { Request, Response } from "express";
import linkModel from "../models/linkModel";
import { v4 as uuidv4 } from "uuid";
import { shareSchema } from "../schema/shareSchema";
import userModel from "../models/userModel";
import { contentModel } from "../models/contentModel";

export const shareBrain = async (req: Request, res: Response): Promise<void> => {
  const validation = shareSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ message: "Invalid share parameter" });
    return;
  }

  const { share } = req.body;
  
  if (share) {
    const content = await linkModel.findOne({ userId: req.userId });
    if (content) {
      res.json({ hash: content.hash });
      return;
    }
    const hash = uuidv4().slice(0, 15);
    await linkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash,
    });
  } else {
    await linkModel.deleteOne({
      userId: req.userId,
    });

    res.json({
      message: "Removed link",
    });
  }
};

export const getBrain = async (req: Request, res: Response) => {
const hash = req.params.shareLink;

  const link = await linkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({
      message: "Sorry incorrect input",
    });
    return;
  }

  const content = await contentModel.find({
    userId: link.userId,
  });

  const user = await userModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res.status(411).json({
      message: "user not found, error should ideally not happen",
    });
    return;
  }

  res.json({
    username: user.username,
    content: content,
  });
}