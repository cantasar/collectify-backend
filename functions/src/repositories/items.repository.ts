import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";
import { Item, ItemPriority } from "../types/item";

const ITEMS = "items";

const toItem = (id: string, data: FirebaseFirestore.DocumentData): Item => ({
  id,
  collectionId: data.collectionId,
  userId: data.userId,
  title: data.title,
  content: data.content ?? "",
  url: data.url,
  imageUrl: data.imageUrl,
  tags: data.tags ?? [],
  priority: data.priority ?? "medium",
  createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
  updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
});

export const findByCollection = async (collectionId: string, userId: string): Promise<Item[]> => {
  const snapshot = await firestore
    .collection(ITEMS)
    .where("userId", "==", userId)
    .where("collectionId", "==", collectionId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toItem(doc.id, doc.data()));
};

export const findById = async (id: string): Promise<Item | null> => {
  const doc = await firestore.collection(ITEMS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return toItem(doc.id, doc.data()!);
};

export interface CreateItemInput {
  collectionId: string;
  userId: string;
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  priority: ItemPriority;
}

export const create = async (input: CreateItemInput): Promise<Item> => {
  const ref = firestore.collection(ITEMS).doc();
  const now = FieldValue.serverTimestamp();

  const payload: Record<string, unknown> = {
    collectionId: input.collectionId,
    userId: input.userId,
    title: input.title,
    content: input.content,
    tags: input.tags,
    priority: input.priority,
    createdAt: now,
    updatedAt: now,
  };
  if (input.url !== undefined) payload.url = input.url;
  if (input.imageUrl !== undefined) payload.imageUrl = input.imageUrl;

  await ref.set(payload);

  const snap = await ref.get();
  return toItem(snap.id, snap.data()!);
};

export interface UpdateItemInput {
  title?: string;
  content?: string;
  url?: string;
  imageUrl?: string;
  tags?: string[];
  priority?: ItemPriority;
}

export const update = async (id: string, input: UpdateItemInput): Promise<Item> => {
  const ref = firestore.collection(ITEMS).doc(id);

  const patch: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;
  if (input.url !== undefined) patch.url = input.url;
  if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.priority !== undefined) patch.priority = input.priority;

  await ref.update(patch);

  const snap = await ref.get();
  return toItem(snap.id, snap.data()!);
};

export const remove = async (id: string): Promise<void> => {
  await firestore.collection(ITEMS).doc(id).delete();
};

export const deleteByCollection = async (collectionId: string, userId: string): Promise<void> => {
  const snapshot = await firestore
    .collection(ITEMS)
    .where("userId", "==", userId)
    .where("collectionId", "==", collectionId)
    .get();

  if (snapshot.empty) {
    return;
  }

  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
};
