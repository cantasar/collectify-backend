import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";
import { Collection } from "../types/collection";
import { ConflictError } from "../utils/errors";

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

export const createWithLimitCheck = async (
  input: CreateCollectionInput,
  maxCollections: number,
): Promise<Collection> => {
  const newRef = firestore.collection(COLLECTIONS).doc();

  await firestore.runTransaction(async (tx) => {
    const countQuery = firestore.collection(COLLECTIONS).where("userId", "==", input.userId);
    const countSnap = await tx.get(countQuery);

    if (countSnap.size >= maxCollections) {
      throw new ConflictError(
        `Collection limit of ${maxCollections} reached`,
        "COLLECTION_LIMIT_REACHED",
      );
    }

    const nameQuery = firestore
      .collection(COLLECTIONS)
      .where("userId", "==", input.userId)
      .where("name", "==", input.name);
    const nameSnap = await tx.get(nameQuery);

    if (!nameSnap.empty) {
      throw new ConflictError(
        "A collection with this name already exists",
        "COLLECTION_NAME_TAKEN",
      );
    }

    tx.set(newRef, {
      userId: input.userId,
      name: input.name,
      description: input.description,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const snap = await newRef.get();
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

export const removeWithItems = async (id: string, userId: string): Promise<void> => {
  const itemsSnap = await firestore
    .collection("items")
    .where("userId", "==", userId)
    .where("collectionId", "==", id)
    .get();

  const batch = firestore.batch();
  itemsSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(firestore.collection(COLLECTIONS).doc(id));
  await batch.commit();
};
