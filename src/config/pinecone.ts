
import { Index, Pinecone } from '@pinecone-database/pinecone';

let pineconeIdx: Index | undefined;

export const startPineocne = async () => {
    try{
        //connecting to pinecone
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });

        // Initialize the Pinecone index. This idx will be used for all operations
        pineconeIdx = pc.index(process.env.PINECONE_INDEX || "")
    }catch(error){
        console.error("Error initializing Pinecone:", error);
    }
}

//functon to get the pinecone index so that we dont have to do pc.index() every time
export const getPineconeIndex = () => {
    if(!pineconeIdx) throw new Error("Pinecone index is not initialized. Please call startPineocne() first.");
    return pineconeIdx;
}

// (async () => {
//     await startPineocne();
//     console.log("Pinecone initialized successfully.");
//     const idx = getPineconeIndex();
//     console.log("Pinecone index name:", idx);

// })()