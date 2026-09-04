import { z } from "zod";
import { FOLLOWUP_ACTIONS } from "@/lib/constants";

/**
 * 跟進紀錄相關 zod schema
 */

export const followupListSchema = z.object({
  applicationId: z.string().min(1),
});

export const followupCreateSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(Object.keys(FOLLOWUP_ACTIONS) as [string, ...string[]]),
  note: z.string().optional(),
});

export type FollowupCreateInput = z.infer<typeof followupCreateSchema>;
