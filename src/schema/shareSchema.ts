import z from "zod";

export const shareSchema = z.object({
  share: z.boolean()
});