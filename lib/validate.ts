import { z } from "zod";

export const EncodePayloadSchema = z.object({
  images: z.array(z.string().url()).min(2).max(30),
  audio: z.string().url().optional(),
  title: z.string().optional(),
  fps: z.number().min(24).max(60).default(30),
  durationPerImage: z.number().min(1).max(5).default(2),
  width: z.number().default(1080),
  height: z.number().default(1920)
});

export type EncodePayload = z.infer<typeof EncodePayloadSchema>;