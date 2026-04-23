import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";
import { Item, CreateItemInput, UpdateItemInput } from "../types/item";
import { FIRESTORE_COLLECTIONS } from "../config/constants";

const { ITEMS } = FIRESTORE_COLLECTIONS;

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

export const findByCollection = async (
  collectionId: string,
  userId: string,
  page?: number,
  limit?: number,
): Promise<{ docs: Item[]; totalCount: number }> => {
  const baseQuery = firestore
    .collection(ITEMS)
    .where("userId", "==", userId)
    .where("collectionId", "==", collectionId);

  const countSnap = await baseQuery.count().get();
  const totalCount = countSnap.data().count;

  let query = baseQuery.orderBy("createdAt", "desc");

  if (page !== undefined && limit !== undefined) {
    query = query.offset((page - 1) * limit).limit(limit);
  }

  const snapshot = await query.get();

  return {
    docs: snapshot.docs.map((doc) => toItem(doc.id, doc.data())),
    totalCount,
  };
};

export const findById = async (id: string): Promise<Item | null> => {
  const doc = await firestore.collection(ITEMS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return toItem(doc.id, doc.data()!);
};

export const create = async (input: CreateItemInput): Promise<Item> => {
  const ref = firestore.collection(ITEMS).doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await ref.get();
  return toItem(snap.id, snap.data()!);
};

export const update = async (id: string, input: UpdateItemInput): Promise<Item> => {
  const ref = firestore.collection(ITEMS).doc(id);

  await ref.update({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const snap = await ref.get();
  return toItem(snap.id, snap.data()!);
};

export const remove = async (id: string): Promise<void> => {
  await firestore.collection(ITEMS).doc(id).delete();
};
