import { RequestHandler } from "express";
import * as service from "../services/items.service";

export const listItems: RequestHandler = async (req, res) => {
  const { page, limit } = req.query as { page?: number; limit?: number };
  const result = await service.listItems(
    req.user!.uid,
    req.params.collectionId as string,
    page,
    limit,
  );
  res.status(200).json({ items: result.data, meta: result.meta });
};

export const createItem: RequestHandler = async (req, res) => {
  const item = await service.createItem(req.user!.uid, req.params.collectionId as string, req.body);
  res.status(201).json(item);
};

export const updateItem: RequestHandler = async (req, res) => {
  const item = await service.updateItem(
    req.user!.uid,
    req.params.collectionId as string,
    req.params.itemId as string,
    req.body,
  );
  res.status(200).json(item);
};

export const deleteItem: RequestHandler = async (req, res) => {
  await service.deleteItem(
    req.user!.uid,
    req.params.collectionId as string,
    req.params.itemId as string,
  );
  res.status(204).send();
};
