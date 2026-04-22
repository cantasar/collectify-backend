export type ItemPriority = "low" | "medium" | "high";

export interface Item {
  id: string;
  collectionId: string;
  userId: string;
  title: string;
  content: string;
  url?: string;
  imageUrl?: string;
  tags: string[];
  priority: ItemPriority;
  createdAt: string;
  updatedAt: string;
}
