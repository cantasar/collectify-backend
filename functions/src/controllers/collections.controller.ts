import { Request, Response } from "express";
import * as service from "../services/collections.service";

export const listCollections = async (req: Request, res: Response): Promise<void> => {
  const collections = await service.listCollections(req.user!.uid);
  res.status(200).json({ collections });
};

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  const collection = await service.createCollection(req.user!.uid, req.body);
  res.status(201).json(collection);
};

export const getCollection = async (req: Request, res: Response): Promise<void> => {
  const collection = await service.getCollectionWithItems(req.user!.uid, req.params.id as string);
  res.status(200).json(collection);
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  const collection = await service.updateCollection(
    req.user!.uid,
    req.params.id as string,
    req.body,
  );
  res.status(200).json(collection);
};

export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  await service.deleteCollection(req.user!.uid, req.params.id as string);
  res.status(204).send();
};
