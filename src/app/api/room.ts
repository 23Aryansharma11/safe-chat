import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import z from "zod";

import { realtime } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { roomTTLSeconds } from "@/utils/constants";
import { authMiddleware } from "./auth-middleware";

export const room = new Elysia({ prefix: "/room" })
  .post("/create", async ({ set, body }) => {
    const roomId = nanoid();
    const redisId = `meta:${roomId}`;
    const { time } = body
    // create a room
    await redis.hset(redisId, {
      connected: [],
      createdAt: Date.now(),
    });

    await redis.expire(redisId, time * 60);
    set.status = 201;
    return { roomId };
  }, {
    body: t.Object({
      time: t.Number({ minimum: 10, maximum: 120 })
    })
  })
  .use(authMiddleware)
  .get(
    "/ttl",
    async ({ auth }) => {
      const ttl = await redis.ttl(`meta:${auth.roomId}`);

      return { ttl: ttl > 0 ? ttl : 0 };
    },
    {
      query: z.object({ roomId: z.string() }),
    },
  )
  .delete(
    "/",
    async ({ auth }) => {
      await realtime
        .channel(auth.roomId)
        .emit("chat.destroy", { isDestroyed: true });
      await Promise.all([
        redis.del(auth.roomId),
        redis.del(`meta:${auth.roomId}`),
        redis.del(`message:${auth.roomId}`),
      ]);
    },
    { query: z.object({ roomId: z.string() }) },
  );
