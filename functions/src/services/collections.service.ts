import { ConflictError, NotFoundError } from "../utils/errors";
import * as repo from "../repositories/collections.repository";
import * as itemsRepo from "../repositories/items.repository";
import { Collection } from "../types/collection";
import { Item } from "../types/item";
import { CreateCollectionBody, UpdateCollectionBody } from "../schemas/collection.schema";

const MAX_COLLECTIONS_PER_USER = 20;

export const listCollections = async (userId: string): Promise<Collection[]> => {
  return repo.findByUser(userId);
};

export const createCollection = async (
  userId: string,
  body: CreateCollectionBody,
): Promise<Collection> => {
  const count = await repo.countByUser(userId);
  if (count >= MAX_COLLECTIONS_PER_USER) {
    throw new ConflictError(
      `Collection limit of ${MAX_COLLECTIONS_PER_USER} reached`,
      "COLLECTION_LIMIT_REACHED",
    );
  }

  const duplicate = await repo.findByUserAndName(userId, body.name);
  if (duplicate) {
    throw new ConflictError("A collection with this name already exists", "COLLECTION_NAME_TAKEN");
  }

  return repo.create({
    userId,
    name: body.name,
    description: body.description ?? "",
  });
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
): Promise<Collection & { items: Item[] }> => {
  const collection = await ensureOwnedCollection(userId, id);
  const items = await itemsRepo.findByCollection(id, userId);
  return { ...collection, items };
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
  await itemsRepo.deleteByCollection(id, userId);
  await repo.remove(id);
};
