import { ObjectId } from 'bson';
import { z } from "zod";
import { OrganisationModel, OrganisationModelSchema, OrganisationResult } from "./Organisation";

export const ImageAspectRatioResult = z.union([
  z.literal("ANY"),
  z.literal("SQUARE"),
  z.literal("LANDSCAPE"),
  z.literal("PORTRAIT"),
]).optional().nullable().describe("What type of image aspect ratio to sort for");

export type ImageAspectRatio = z.infer<typeof ImageAspectRatioResult>;

export const ImageSourceResult = z.union([
  z.literal("ANY"),
  z.literal("PRODUCTS"),
  z.literal("SEARCH"),
]).optional().nullable().describe("Where to source images from");

export const BlogTypeResult = z.union([
  z.literal("RECIPE"),
  z.literal("TOPIC"),
  z.literal("PRODUCT"),
]).optional().nullable().describe("What type of blog (prompt) we are using");

export const ProductResult = z.object({
  id: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export type Product = z.infer<typeof ProductResult>;

export const ImageResult = z.object({
  url: z.string().nullable().optional().describe("Sourced image URL"),
  alt: z.string().nullable().optional().describe("Sourced image alt text"),
  credit: z.string().nullable().optional().describe("Sourced image credit/attribution"),
});

export type Image = z.infer<typeof ImageResult>;

export const UpcomingPostsResult = z.object({
  title: z.string().nullable().optional().describe("Title of post, used to generate the content"),
  image: ImageResult.nullable().optional().describe("The sourced image"),
  products: z.array(ProductResult).nullable().optional().describe("Products we will be including in post")
}).describe("An upcoming blog post prompt");

export type UpcomingPosts = z.infer<typeof UpcomingPostsResult>;

export const CompletedPostsResult = z.object({
  title: z.string().nullable().optional().describe("Title of post, used to generate the content"),
  id: z.string().nullable().optional().describe("GQL ID for post"),
}).describe("An upcoming blog post prompt");

export type CompletedPosts = z.infer<typeof CompletedPostsResult>;

export const BlogInputResult = z.object({
  disabled: z.boolean().nullable().optional(),
  // Settings
  blogType: BlogTypeResult,
  blogTopic: z.string().nullable().optional().describe("Supplied prompt/topic for writing TOPIC posts"),
  enabledFormats: z.object({
    allEnabled: z.boolean().nullable().optional(),
    enabled: z.array(z.string()).nullable().optional().describe("Array of blog post formats")
  }).nullable().optional().describe("Keeps track of what blog post formats we are using e.g. Listicles"),
  enabledProducts: z.object({
    allEnabled: z.boolean().nullable().optional(),
    enabled: z.array(ProductResult).nullable().optional().describe("Array of approved products")
  }).nullable().optional().describe("Keeps track of what products we are mentioning in posts"),
  keywords: z.array(z.string()).nullable().optional().describe("Array of keywords to mention in blog posts"),
  authorName: z.string().nullable().optional().describe("Name of author when publishing"),
  blogId: z.string().nullable().optional().describe("ID of blog we are publishing to"),
  language: z.string().nullable().optional().describe("Language of blog"),
  publishPosts: z.boolean().nullable().optional().describe("Published as draft if false, active if true"),
  publishDays: z.object({
    monday: z.boolean().nullable().optional(),
    tuesday: z.boolean().nullable().optional(),
    wednesday: z.boolean().nullable().optional(),
    thursday: z.boolean().nullable().optional(),
    friday: z.boolean().nullable().optional(),
    saturday: z.boolean().nullable().optional(),
    sunday: z.boolean().nullable().optional(),
  }).nullable().optional().describe("What days to publish posts on"),
  titleCustomPrompt: z.string().nullable().optional().describe("Additional instructions for generating titles"),
  titleWordLimit: z.number().nullable().optional().describe("Word limit for titles"),
  bodyCustomPrompt: z.string().nullable().optional().describe("Additional instructions for generating blog post content"),
  bodyWordCount: z.number().nullable().optional().describe("preferred word count for articles"),
  imageKeywords: z.string().nullable().optional().describe("Image keywords to override image searching"),
  imageAspectRatio: ImageAspectRatioResult,
  imageSource: ImageSourceResult,
  imageWidth: z.number().nullable().optional().describe("Image keywords to override image searching"),
  // Upcoming posts
  upcomingPosts: z.array(UpcomingPostsResult).nullable().optional().describe("Array of upcoming blog posts for this blog"),
  // Completed posts
  completedPosts: z.array(CompletedPostsResult).nullable().optional().describe("Array of blog posts we have already generated"),
});

export type BlogInputResultEntity = z.infer<typeof BlogInputResult>;

export const BlogPayloadResult = z.object({
  ...BlogInputResult.shape,
  id: z.string().nullable().optional(),
});

export type BlogPayloadResultEntity = z.infer<typeof BlogPayloadResult>;

export const BlogResult = z.object({
  ...BlogInputResult.shape,
  _id: z.instanceof(ObjectId),
  org: z.union([
    z.instanceof(ObjectId),
    OrganisationResult,
  ]).describe("The owner of this blog"),
  // Timestamps
  createdAt: z.date().nullable().optional(),
  lastPostPublished: z.date().nullable().optional(),
  lastUpdated: z.date().nullable().optional(),
});

export type BlogResultEntity = z.infer<typeof BlogResult>;

export const BlogModelSchema = z.object({
  ...BlogInputResult.shape,
  id: z.string(),
  org: z.union([
    z.string(),
    OrganisationModelSchema,
  ]),
  createdAt: z.date().nullable().optional(),
  lastPostPublished: z.date().nullable().optional(),
  lastUpdated: z.date().nullable().optional(),
});

export type BlogModel = z.infer<typeof BlogModelSchema>;

export const BlogModel = {
  convertFromEntity(entity: BlogResultEntity, includeCredentials = false): BlogModel {
    const obj: BlogModel = {
      ...entity,
      id: entity._id.toHexString(),
      // @ts-ignore
      org: ObjectId.isValid(entity.org) ? entity._id.toHexString() : OrganisationModel.convertFromEntity(entity.org, includeCredentials),
      ...entity.lastPostPublished && { lastPostPublished: new Date(entity.lastPostPublished || new Date()) },
      ...entity.lastUpdated && { lastUpdated: new Date(entity.lastUpdated || new Date()) },
      ...entity.createdAt && { createdAt: new Date(entity.createdAt || new Date()) },
    };
    return BlogModelSchema.parse(obj);
  },
};