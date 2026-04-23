export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionInput {
  userId: string;
  name: string;
  description: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
}
