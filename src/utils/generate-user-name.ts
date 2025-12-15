import { nanoid } from "nanoid";
import { CHARACTERS } from "./characters";

export const generateUserName = (): string => {
  const word = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  return word + "-" + nanoid(5);
};
