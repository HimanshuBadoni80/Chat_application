import * as z from "zod";
import { nanoidRegex } from "@/lib/Models/User";
// the schema for  init/route should check for six character as it is constructed with nanoid
export const initChatSchema = z.string().regex(nanoidRegex);


