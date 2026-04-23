import { Request, Response } from "express";
import * as service from "../services/items.service";

export const listItems = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const result = await service.listItems(
    req.user!.uid,
    req.params.collectionId as string,
    page,
    limit,
  );
  res.status(200).json({ items: result.data, meta: result.meta });
};

export const createItem = async (req: Request, res: Response): Promise<void> => {
  const item = await service.createItem(req.user!.uid, req.params.collectionId as string, req.body);
  res.status(201).json(item);
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const item = await service.updateItem(
    req.user!.uid,
    req.params.collectionId as string,
    req.params.itemId as string,
    req.body,
  );
  res.status(200).json(item);
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  await service.deleteItem(
    req.user!.uid,
    req.params.collectionId as string,
    req.params.itemId as string,
  );
  res.status(204).send();
};
