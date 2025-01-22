import { and, eq } from "drizzle-orm";
import { tasks, users, type Task } from "~/drizzle/schema";
import { db } from "~/lib/db.server";

export async function createTask(
  id: string,
  userId: string,
  description: string
) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    if (!user) {
      console.error("no user found");
      return undefined;
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        id,
        userId: user[0].id,
        description,
        completed: false,
      })
      .returning();

    if (!newTask) {
      return undefined;
    }

    return newTask;
  } catch (error: any) {
    console.error("Error reading task", error.message);
    return undefined;
  }
}

export async function updateTask(
  userId: string,
  id: string,
  fields: Partial<Omit<Task, "id" | "createdAt">>
) {
  try {
    const [updatedTask] = await db
      .update(tasks)
      .set(fields)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask) {
      return undefined;
    }

    return updatedTask;
  } catch (error: any) {
    console.error("Error updating task", error.message);
    return undefined;
  }
}

export async function deleteTask(userId: string, id: string) {
  try {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .execute();
  } catch (error) {
    return undefined;
  }
}

export async function clearCompleted(userId: string) {
  const clearedTasks = await db
    .delete(tasks)
    .where(and(eq(tasks.completed, true), eq(tasks.userId, userId)))
    .returning();

  return clearedTasks;
}

export async function deleteAll(userId: string) {
  const clearedTasks = await db
    .delete(tasks)
    .where(eq(tasks.userId, userId))
    .returning();

  return clearedTasks;
}
