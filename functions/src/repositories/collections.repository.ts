import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";
import { Collection } from "../types/collection";

const COLLECTIONS = "collections";

const toCollection = (id: string, data: FirebaseFirestore.DocumentData): Collection => ({
  id,
  userId: data.userId,
  name: data.name,
  description: data.description ?? "",
  createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
  updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
});

export const findByUser = async (userId: string): Promise<Collection[]> => {
  const snapshot = await firestore
    .collection(COLLECTIONS)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => toCollection(doc.id, doc.data()));
};

export const findById = async (id: string): Promise<Collection | null> => {
  const doc = await firestore.collection(COLLECTIONS).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return toCollection(doc.id, doc.data()!);
};

export const countByUser = async (userId: string): Promise<number> => {
  const snapshot = await firestore
    .collection(COLLECTIONS)
    .where("userId", "==", userId)
    .count()
    .get();
  return snapshot.data().count;
};

export const findByUserAndName = async (
  userId: string,
  name: string,
): Promise<Collection | null> => {
  const snapshot = await firestore
    .collection(COLLECTIONS)
    .where("userId", "==", userId)
    .where("name", "==", name)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return toCollection(doc.id, doc.data());
};

export interface CreateCollectionInput {
  userId: string;
  name: string;
  description: string;
}

export const create = async (input: CreateCollectionInput): Promise<Collection> => {
  const ref = firestore.collection(COLLECTIONS).doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    userId: input.userId,
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await ref.get();
  return toCollection(snap.id, snap.data()!);
};

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
}

export const update = async (id: string, input: UpdateCollectionInput): Promise<Collection> => {
  const ref = firestore.collection(COLLECTIONS).doc(id);

  const patch: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;

  await ref.update(patch);

  const snap = await ref.get();
  return toCollection(snap.id, snap.data()!);
};

export const remove = async (id: string): Promise<void> => {
  await firestore.collection(COLLECTIONS).doc(id).delete();
};
