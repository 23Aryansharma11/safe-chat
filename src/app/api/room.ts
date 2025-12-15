import { Elysia } from "elysia";
import { nanoid } from "nanoid";

import { redis } from "@/lib/redis";
import { roomTTLSeconds } from "@/utils/constants";

export const room = new Elysia({ prefix: "/room" }).post(
  "/create",
  async () => {
    const roomId = nanoid();
    const redisId = `meta:${roomId}`;
    // create a room
    await redis.hset(redisId, {
      connected: [],
      createdAt: Date.now(),
    });

    await redis.expire(redisId, roomTTLSeconds);
    return { roomId };
  },
);
