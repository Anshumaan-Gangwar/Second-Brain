import { Request, Response } from "express";
import { fetchTwitter, fetchWebsite, fetchYouTube, handleNote } from "../services/getMetaData";
import { getFinalEmbedding } from "../services/embeddings";
import { contentModel } from "../models/contentModel";
import { getPineconeIndex } from "../config/pinecone";
import mongoose from "mongoose";

export const getContent = async (req: Request, res: Response) => {
   const userId = req.userId;
  try {
    const content = await contentModel.find({ userId: userId }).populate(
      "userId",
      "username"
    );
    if (content.length == 0) {
      res.json({
        content: [
          {
            _id: "default-1",
            type: "Note",
            title: "Welcome to Conscious!",
            content:
              "This is your default content. Start exploring now! click on Add Memory to add more content",
            imageUrl: null,
            createdAt: Date.now()
          },
        ],
      });
      return;
    }
    res.status(200).json({
      content: content.map((item) => ({
        _id: item._id,
        title: item.title,
        type: item.type,
        content: item.content,
        link: item.link || null,
        imageUrl: item.imageUrl || null, 
        userId: item.userId,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const addContent = async (req: Request, res: Response) => {

    const {link, title, content} = req.body;
    let contentToSave = content || "";
    let titleToSave = title || "";
    let url: string
    let imageUrl: string | null;
    let metadata;
    try{
        if(link){
            //link is there means it is not a note
            if (link.match(/youtube\.com|youtu\.be/i)) {
                metadata = await fetchYouTube(link);
            } 
            else if (link.match(/twitter\.com|x\.com/i)) {
                metadata = await fetchTwitter(link);
            }
            else {
                metadata = await fetchWebsite(link);
            }
            titleToSave = titleToSave || metadata.title;
            contentToSave = metadata.content;
            url = metadata.url || link; // well both are same things
            imageUrl = metadata.thumbnail;
        }else{
            //link is not there means it is a note
            metadata = await handleNote(titleToSave, contentToSave);
            imageUrl = metadata.thumbnail;
        }

        const timeStamp = new Date().toISOString();
        
        const newContent = await contentModel.create({
            title: titleToSave,
            type: link ? "link" : "note",
            link: link || "",
            content: contentToSave,
            imageUrl: imageUrl,
            tag: [],
            userId: req.userId
        })
        console.log("New content created:", newContent);
        const textForEmbedding = `${metadata.title}\n${metadata.content}\n${timeStamp}`;

        const embeddings = await getFinalEmbedding(textForEmbedding);
        const  pineconeIdx = getPineconeIndex();

        await pineconeIdx.upsert([{
                id: newContent._id.toString(),
                values: embeddings || [],
                metadata: {
                    userId: req.userId?.toString() || "",
                    title: metadata.title,
                    content: metadata.content,
                    url: metadata.url || "",
                    imageUrl: metadata.thumbnail || "",
                    type: newContent.type,
                    timeStamp: timeStamp
                }
            }     
        ])

        res.status(201).json({
            message: "Content added successfully",
            contentId: newContent._id,
        });
    }catch(error){
        console.error("Error adding content:", error);
        res.status(500).json({
            message: "Failed to add content",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }


}

export const deleteContent = async (req: Request, res: Response) => {
const { contentId } = req.params;

  if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
    res.status(400).json({ error: "Invalid or missing content ID" });
    return;
  }

  try {
   
    await contentModel.deleteOne({ _id: contentId, userId: req.userId });
    // Delete from Pinecone
    const pineconeIndex = getPineconeIndex();
    await pineconeIndex.deleteOne(contentId);

    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ message: "Error deleting content" });
  }
}