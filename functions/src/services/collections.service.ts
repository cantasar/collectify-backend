import { NotFoundError, ConflictError } from "../utils/errors";
import * as repo from "../repositories/collections.repository";
import * as itemsRepo from "../repositories/items.repository";
import { Collection } from "../types/collection";
import { Item } from "../types/item";
import { PaginatedResult } from "../types/common";
import { CreateCollectionBody, UpdateCollectionBody } from "../schemas/collection.schema";
import { MAX_COLLECTIONS_PER_USER } from "../config/constants";

export const listCollections = async (
  userId: string,
  page?: number,
  limit?: number,
): Promise<PaginatedResult<Collection>> => {
  const { docs, totalCount } = await repo.findByUser(userId, page, limit);
  return {
    data: docs,
    meta: {
      page: page ?? 1,
      limit: limit ?? totalCount,
      totalCount,
      totalPages: limit ? Math.ceil(totalCount / limit) : 1,
    },
  };
};

export const createCollection = async (
  userId: string,
  body: CreateCollectionBody,
): Promise<Collection> => {
  return repo.createWithLimitCheck(
    { userId, name: body.name, description: body.description ?? "" },
    MAX_COLLECTIONS_PER_USER,
  );
};

export const ensureOwnedCollection = async (userId: string, id: string): Promise<Collection> => {
  const collection = await repo.findById(id);
  if (!collection || collection.userId !== userId) {
    throw new NotFoundError("Collection not found");
  }
  return collection;
};

export const getCollectionWithItems = async (
  userId: string,
  id: string,
  page?: number,
  limit?: number,
): Promise<Collection & { items: PaginatedResult<Item> }> => {
  const collection = await ensureOwnedCollection(userId, id);
  const { docs, totalCount } = await itemsRepo.findByCollection(id, userId, page, limit);
  return {
    ...collection,
    items: {
      data: docs,
      meta: {
        page: page ?? 1,
        limit: limit ?? totalCount,
        totalCount,
        totalPages: limit ? Math.ceil(totalCount / limit) : 1,
      },
    },
  };
};

export const updateCollection = async (
  userId: string,
  id: string,
  body: UpdateCollectionBody,
): Promise<Collection> => {
  const existing = await ensureOwnedCollection(userId, id);

  if (body.name !== undefined && body.name !== existing.name) {
    const duplicate = await repo.findByUserAndName(userId, body.name);
    if (duplicate && duplicate.id !== id) {
      throw new ConflictError(
        "A collection with this name already exists",
        "COLLECTION_NAME_TAKEN",
      );
    }
  }

  return repo.update(id, body);
};

export const deleteCollection = async (userId: string, id: string): Promise<void> => {
  await ensureOwnedCollection(userId, id);
  await repo.removeWithItems(id, userId);
};
