export interface Item {
  id: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  editing?: boolean;
}

/**
 * Interface representing a Todo item with various CRUD operations.
 */
export interface Todo {
  /**
   * Creates a new Todo item.
   * @param description - The description of the Todo item.
   * @returns A promise that resolves to the created Todo item.
   */
  create: (description: string) => Promise<Item>;

  /**
   * Reads all Todo items.
   * @returns A promise that resolves to an array of Todo items.
   */
  read: () => Promise<Item[]>;

  /**
   * Updates an existing Todo item.
   * @param id - The ID of the Todo item to update.
   * @param fields - The fields to update in the Todo item, excluding `id` and `createdAt`.
   * @returns A promise that resolves to the updated Todo item.
   */
  update: (
    id: string,
    fields: Partial<Omit<Item, "id" | "createdAt">>
  ) => Promise<Item | undefined>;

  /**
   * Deletes a Todo item.
   * @param id - The ID of the Todo item to delete.
   * @returns A promise that resolves to the deleted Todo item, or `undefined` if the item was not found.
   */
  delete: (id: string) => Promise<Item | undefined>;

  /**
   * Clears all completed Todo items.
   * @returns A promise that resolves to an array of the remaining Todo items.
   */
  clearCompleted: () => Promise<Item[]>;

  /**
   * Deletes all Todo items.
   * @returns A promise that resolves to an array of the deleted Todo items.
   */
  deleteAll: () => Promise<Item[]>;
}
