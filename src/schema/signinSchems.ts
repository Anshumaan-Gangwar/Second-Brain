import z from "zod";

export const signinSchema = z.object({
    username: z.string(),
    password: z.string()
})