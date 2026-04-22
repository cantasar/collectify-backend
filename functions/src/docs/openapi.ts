import { z } from "zod";
import { createCollectionSchema, updateCollectionSchema } from "../schemas/collection.schema";

const jsonBody = (schemaName: string) => ({
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaName}` },
    },
  },
});

const errorResponse = (description: string) => ({
  description,
  ...jsonBody("Error"),
});

const collectionExample = {
  id: "abc123",
  userId: "user_xyz",
  name: "Reading list",
  description: "Articles to read later",
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Collectify API",
    version: "1.0.0",
    description: "Authenticate with `Authorization: Bearer <Firebase ID token>`.",
  },
  servers: [{ url: "/" }],
  security: [{ bearerAuth: [] }],
  paths: {
    "/collections": {
      get: {
        summary: "List the authenticated user's collections",
        responses: {
          "200": { description: "OK", ...jsonBody("CollectionList") },
          "401": errorResponse("Missing or invalid token"),
        },
      },
      post: {
        summary: "Create a collection",
        requestBody: { required: true, ...jsonBody("CreateCollection") },
        responses: {
          "201": { description: "Created", ...jsonBody("Collection") },
          "400": errorResponse("Validation failed"),
          "401": errorResponse("Missing or invalid token"),
          "409": errorResponse("Name already used or collection limit reached"),
        },
      },
    },
    "/collections/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        summary: "Get a collection with its items",
        responses: {
          "200": { description: "OK", ...jsonBody("CollectionWithItems") },
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
        },
      },
      put: {
        summary: "Update a collection",
        requestBody: { required: true, ...jsonBody("UpdateCollection") },
        responses: {
          "200": { description: "OK", ...jsonBody("Collection") },
          "400": errorResponse("Validation failed"),
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
          "409": errorResponse("Name already used"),
        },
      },
      delete: {
        summary: "Delete a collection and all its items",
        responses: {
          "204": { description: "Deleted" },
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      CreateCollection: z.toJSONSchema(createCollectionSchema),
      UpdateCollection: z.toJSONSchema(updateCollectionSchema),
      Collection: { type: "object", example: collectionExample },
      CollectionList: {
        type: "object",
        example: { collections: [collectionExample] },
      },
      CollectionWithItems: {
        type: "object",
        example: { ...collectionExample, items: [] },
      },
      Error: {
        type: "object",
        example: {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: [{ field: "name", message: "Required" }],
          },
        },
      },
    },
  },
};
