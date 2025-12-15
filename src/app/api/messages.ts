import Elysia from "elysia";
import { z } from "zod";

import { Message, realtime } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
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

      const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
      };

      // add message to history
      await redis.rpush(`messages:${roomId}`, {
        ...message,
        token: auth.token,
      });

      await realtime.channel(roomId).emit("chat.message", message);

      const remaining = await redis.ttl(`meta:${roomId}`);

      await redis.expire(`messages:${roomId}`, remaining);
      await redis.expire(`history:${roomId}`, remaining);
      await redis.expire(roomId, remaining);
    },
    {
      body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000),
      }),
      query: z.object({ roomId: z.string() }),
    },
  );
