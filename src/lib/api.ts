import { treaty } from "@elysiajs/eden";
import type { appType } from "@/app/api/[[...slugs]]/route";

export const { api } = treaty<appType>("localhost:3000");