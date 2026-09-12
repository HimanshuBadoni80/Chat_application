import { Types } from "mongoose";

export function toIdString(id: Types.ObjectId | string): string {
  return id.toString();
}

export function toIdStringOptional(
  id?: Types.ObjectId | string,
): string | undefined {
  return id ? id.toString() : undefined;
}

export function toISOStringSafe(date: Date): string {
    return date.toISOString();
}
