import Elysia from "elysia";
import { z } from "zod";

import { redis } from "@/lib/redis";
import { authMiddleware } from "./auth-middleware";

export const messages = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ auth, body }) => {
      const { sender, text } = body;
      const { roomId } = auth;

      const roomExists = await redis.exists("meta:" + roomId);

      if (!roomExists) {
        throw new Error("Room does not exist");
      }
    },
    {
      body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000),
      }),
      query: z.object({ roomId: z.string() }),
    },
  );
