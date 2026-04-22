import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../config/firebase";
import { Item } from "../types/item";

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
