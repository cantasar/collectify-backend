import { NotFoundError } from "../utils/errors";
import * as repo from "../repositories/items.repository";
import { ensureOwnedCollection } from "./collections.service";
import { Item } from "../types/item";
import { PaginatedResult } from "../types/common";
import { CreateItemBody, UpdateItemBody } from "../schemas/item.schema";

export const listItems = async (
  userId: string,
  collectionId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<Item>> => {
  await ensureOwnedCollection(userId, collectionId);
  const { docs, totalCount } = await repo.findByCollection(collectionId, userId, page, limit);
  return {
    data: docs,
    meta: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
  };
};

export const createItem = async (
  userId: string,
  collectionId: string,
  body: CreateItemBody,
): Promise<Item> => {
  await ensureOwnedCollection(userId, collectionId);

  return repo.create({
    collectionId,
    userId,
    title: body.title,
    content: body.content ?? "",
    url: body.url,
    imageUrl: body.imageUrl,
    tags: body.tags ?? [],
    priority: body.priority ?? "medium",
  });
};

const ensureOwnedItem = async (
  userId: string,
  collectionId: string,
  itemId: string,
): Promise<Item> => {
  const item = await repo.findById(itemId);
  if (!item || item.userId !== userId || item.collectionId !== collectionId) {
    throw new NotFoundError("Item not found");
  }
  return item;
};

export const updateItem = async (
  userId: string,
  collectionId: string,
  itemId: string,
  body: UpdateItemBody,
): Promise<Item> => {
  await ensureOwnedCollection(userId, collectionId);
  await ensureOwnedItem(userId, collectionId, itemId);
  return repo.update(itemId, body);
};

export const deleteItem = async (
  userId: string,
  collectionId: string,
  itemId: string,
): Promise<void> => {
  await ensureOwnedCollection(userId, collectionId);
  await ensureOwnedItem(userId, collectionId, itemId);
  await repo.remove(itemId);
};
