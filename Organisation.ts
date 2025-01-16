import { ObjectId } from 'bson';
import { z } from "zod";

export const ShopifyConnectionResult = z.object({
  apiKey: z.string(),
  domain: z.string(),
  scopes: z.string().nullable().optional().describe("The scopes approved (comma seperated string)")
}).optional().nullable();

export type ShopifyConnection = z.infer<typeof ShopifyConnectionResult>;

export const ShopifyStatusResult = z.union([
  z.literal("ACTIVE"),
  z.literal("PENDING"),
  z.literal("INACTIVE"),
  z.literal("ERROR"),
]).optional().nullable();

export const OrganisationResult = z.object({
  _id: z.instanceof(ObjectId),
  country: z.string().optional().nullable().describe("country of origin"),
  plan: z.string().optional().nullable().describe("shopify plan"),
  orgType: z.null().optional(),
  createdAt: z.date().nullable().optional(),
  shopifyConnection: ShopifyConnectionResult,
  shopifyConnectionStatus: ShopifyStatusResult,
});

export type OrganisationResultEntity = z.infer<typeof OrganisationResult>;

export const OrganisationModelSchema = z.object({
  id: z.string(),
  orgType: OrganisationResult.shape.orgType,
  country: OrganisationResult.shape.country,
  plan: OrganisationResult.shape.plan,
  shopifyConnection: OrganisationResult.shape.shopifyConnection,
  shopifyConnectionStatus: OrganisationResult.shape.shopifyConnectionStatus,
  createdAt: OrganisationResult.shape.createdAt,
  shopifySite: z.string().nullable().optional(),
});

export type OrganisationModel = z.infer<typeof OrganisationModelSchema>;

export const OrganisationModel = {
  convertFromEntity(entity: OrganisationResultEntity, includeCredentials = false): OrganisationModel {
    if(includeCredentials) {
      console.log("includeCredentials IS TRUE")
    }

    const obj: OrganisationModel = {
      id: entity._id.toHexString(),
      orgType: null,
      country: entity.country || null,
      plan: entity.plan || null,
      createdAt: new Date(entity.createdAt || new Date()),
      shopifyConnection: includeCredentials ? (entity.shopifyConnection || null) : null,
      shopifyConnectionStatus: entity.shopifyConnectionStatus || "INACTIVE",
      shopifySite: entity?.shopifyConnection?.domain || null,
    };
    return OrganisationModelSchema.parse(obj);
  },
};