import { ObjectId } from "bson";
import { z } from "zod";

export const ValidatedLinkResult = z.object({
  _id: z.instanceof(ObjectId),
  url: z.string().describe("Exact URL string that previously passed link validation"),
  status: z.number().int().nullable().optional().describe("Last successful HTTP status code"),
  createdAt: z.date().nullable().optional().describe("TTL anchor for expiring cached successful link checks"),
  lastCheckedAt: z
    .date()
    .nullable()
    .optional()
    .describe("Most recent time this URL successfully passed link validation"),
});

export type ValidatedLinkResultEntity = z.infer<typeof ValidatedLinkResult>;

export const ValidatedLinkModelSchema = z.object({
  id: z.string(),
  url: ValidatedLinkResult.shape.url,
  status: ValidatedLinkResult.shape.status,
  createdAt: ValidatedLinkResult.shape.createdAt,
  lastCheckedAt: ValidatedLinkResult.shape.lastCheckedAt,
});

export type ValidatedLinkModel = z.infer<typeof ValidatedLinkModelSchema>;

export const ValidatedLinkModel = {
  convertFromEntity(entity: ValidatedLinkResultEntity): ValidatedLinkModel {
    const obj: ValidatedLinkModel = {
      id: entity._id.toHexString(),
      url: entity.url,
      status: entity.status || null,
      createdAt: entity.createdAt ? new Date(entity.createdAt || new Date()) : null,
      lastCheckedAt: entity.lastCheckedAt ? new Date(entity.lastCheckedAt || new Date()) : null,
    };
    return ValidatedLinkModelSchema.parse(obj);
  },
};
