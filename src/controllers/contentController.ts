import { Request, Response } from "express";
import { fetchTwitter, fetchWebsite, fetchYouTube } from "../services/getMetaData";
import { getFinalEmbedding } from "../services/embeddings";

export const getContent = async (req: Request, res: Response) => {
   
}

export const addContent = async (req: Request, res: Response) => {
    // const {link, title, content} = req.body;
    const {text} = req.body;
    try{
        // const result = await fetchWebsite(link);
        const result = await getFinalEmbedding(text);
        res.json({ message: "Content retrieved successfully", result });
    }catch(error){
        console.error("Error fetching website metadata:", error);
    }
    
}

export const deleteContent = async (req: Request, res: Response) => {

}