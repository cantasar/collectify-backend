import { RequestHandler } from "express";
import * as service from "../services/collections.service";

export const listCollections: RequestHandler = async (req, res) => {
  const { page, limit } = req.query as { page?: number; limit?: number };
  const result = await service.listCollections(req.user!.uid, page, limit);
  res.status(200).json({ collections: result.data, meta: result.meta });
};

export const createCollection: RequestHandler = async (req, res) => {
  const collection = await service.createCollection(req.user!.uid, req.body);
  res.status(201).json(collection);
};

export const getCollection: RequestHandler = async (req, res) => {
  const { page, limit } = req.query as { page?: number; limit?: number };
  const result = await service.getCollectionWithItems(
    req.user!.uid,
    req.params.id as string,
    page,
    limit,
  );
  res.status(200).json(result);
};

export const updateCollection: RequestHandler = async (req, res) => {
  const collection = await service.updateCollection(
    req.user!.uid,
    req.params.id as string,
    req.body,
  );
  res.status(200).json(collection);
};

export const deleteCollection: RequestHandler = async (req, res) => {
  await service.deleteCollection(req.user!.uid, req.params.id as string);
  res.status(204).send();
};
