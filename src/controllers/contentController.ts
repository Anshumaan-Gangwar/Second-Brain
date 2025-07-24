import { Request, Response } from "express";
import { fetchTwitter, fetchWebsite, fetchYouTube } from "../services/getMetaData";

export const getContent = async (req: Request, res: Response) => {
   
}

export const addContent = async (req: Request, res: Response) => {
    const {link, title, content} = req.body;
    try{
        const result = await fetchWebsite(link);
        res.json({ message: "Content retrieved successfully", result });
    }catch(error){
        console.error("Error fetching website metadata:", error);
    }
    
}

export const deleteContent = async (req: Request, res: Response) => {

}