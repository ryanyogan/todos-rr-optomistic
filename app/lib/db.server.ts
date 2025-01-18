import type { Item, Todo } from "~/types";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "~/drizzle/schema";

const sqlite = new Database(process.env.DATABASE_URL);
export const db = drizzle(sqlite, { schema });

void migrate(db, { migrationsFolder: "app/drizzle/migrations" });

/**
 * List of todo items.
 */
const items: Item[] = [];

/**
 * An implementation of the `Todo` interface that manages a collection of todo items.
 */
export const todos: Todo = {
  async create(description: string) {
    const createdTodo: Item = {
      id: Math.random().toString(16).slice(2),
      description,
      completed: false,
      createdAt: new Date(),
    };

    items.push(createdTodo);

    return createdTodo;
  },

  async read() {
    return items;
  },

  async update(id: string, fields: Partial<Omit<Item, "id" | "createdAt">>) {
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return undefined;
    }

    const updatedTodo: Item = {
      ...items[itemIndex],
      ...fields,
      completedAt: fields.completed ? fields.completedAt : undefined,
    };

    items[itemIndex] = updatedTodo;

    return updatedTodo;
  },

  async delete(id: string) {
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return undefined;
    }

    const [deletedTodo] = items.splice(itemIndex, 1);

    return deletedTodo;
  },

  async clearCompleted() {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].completed) {
        items.splice(i, 1);
      }
    }

    return items;
  },

  async deleteAll() {
    items.length = 0;
    return items;
  },
};
