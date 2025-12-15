import { Elysia } from "elysia";
// apis
import { messages } from "@/app/api/messages";
import { room } from "@/app/api/room";

const app = new Elysia({ prefix: "/api" }).use(room).use(messages);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;

export type appType = typeof app;
