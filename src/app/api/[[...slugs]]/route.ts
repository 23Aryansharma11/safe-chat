import { Elysia } from "elysia";
// apis
import { room } from "@/app/api/room";

const app = new Elysia({ prefix: "/api" }).use(room);

export const GET = app.fetch;
export const POST = app.fetch;

export type appType = typeof app;
