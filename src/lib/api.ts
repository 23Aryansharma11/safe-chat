import type { appType } from "@/app/api/[[...slugs]]/route";
import { treaty } from "@elysiajs/eden";

export const { api } = treaty<appType>("https://safe-chat-tan.vercel.app");
// export const { api } = treaty<appType>("http://localhost:3000");