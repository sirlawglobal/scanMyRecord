import { nanoid } from "nanoid";

export function generateShortCode(length = 10) {
  return nanoid(length);
}
