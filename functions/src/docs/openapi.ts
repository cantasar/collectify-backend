import { z } from "zod";
import { createCollectionSchema, updateCollectionSchema } from "../schemas/collection.schema";
import { createItemSchema, updateItemSchema } from "../schemas/item.schema";

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

const itemExample = {
  id: "item789",
  collectionId: "abc123",
  userId: "user_xyz",
  title: "How to build a REST API",
  content: "Notes on clean API design",
  url: "https://example.com/article",
  imageUrl: "https://example.com/cover.jpg",
  tags: ["api", "backend"],
  priority: "medium",
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
  tags: [
    { name: "Collections", description: "Collection CRUD operations" },
    { name: "Items", description: "Item CRUD operations within a collection" },
  ],
  paths: {
    "/collections": {
      get: {
        tags: ["Collections"],
        summary: "List the authenticated user's collections",
        responses: {
          "200": { description: "OK", ...jsonBody("CollectionList") },
          "401": errorResponse("Missing or invalid token"),
        },
      },
      post: {
        tags: ["Collections"],
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
        tags: ["Collections"],
        summary: "Get a collection with its items",
        responses: {
          "200": { description: "OK", ...jsonBody("CollectionWithItems") },
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
        },
      },
      put: {
        tags: ["Collections"],
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
        tags: ["Collections"],
        summary: "Delete a collection and all its items",
        responses: {
          "204": { description: "Deleted" },
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
        },
      },
    },
    "/collections/{collectionId}/items": {
      parameters: [
        { name: "collectionId", in: "path", required: true, schema: { type: "string" } },
      ],
      get: {
        tags: ["Items"],
        summary: "List items in a collection",
        responses: {
          "200": { description: "OK", ...jsonBody("ItemList") },
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
        },
      },
      post: {
        tags: ["Items"],
        summary: "Add an item to a collection",
        requestBody: { required: true, ...jsonBody("CreateItem") },
        responses: {
          "201": { description: "Created", ...jsonBody("Item") },
          "400": errorResponse("Validation failed"),
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Collection not found"),
        },
      },
    },
    "/collections/{collectionId}/items/{itemId}": {
      parameters: [
        { name: "collectionId", in: "path", required: true, schema: { type: "string" } },
        { name: "itemId", in: "path", required: true, schema: { type: "string" } },
      ],
      put: {
        tags: ["Items"],
        summary: "Update an item",
        requestBody: { required: true, ...jsonBody("UpdateItem") },
        responses: {
          "200": { description: "OK", ...jsonBody("Item") },
          "400": errorResponse("Validation failed"),
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Item not found"),
        },
      },
      delete: {
        tags: ["Items"],
        summary: "Delete an item",
        responses: {
          "204": { description: "Deleted" },
          "401": errorResponse("Missing or invalid token"),
          "404": errorResponse("Item not found"),
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
        example: { ...collectionExample, items: [itemExample] },
      },
      CreateItem: z.toJSONSchema(createItemSchema),
      UpdateItem: z.toJSONSchema(updateItemSchema),
      Item: { type: "object", example: itemExample },
      ItemList: {
        type: "object",
        example: { items: [itemExample] },
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
