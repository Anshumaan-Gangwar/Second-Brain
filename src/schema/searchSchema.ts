import z from "zod";

export const searchSchema = z.object({
    query: z.string().min(1, "Search query must not be empty"),
})