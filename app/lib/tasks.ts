import invariant from "tiny-invariant";
import { INTENTS } from "~/types";
import { todos } from "./db.server";

export async function executeHandler(
  intent: string,
  formData: FormData
): Promise<void> {
  const handler = handlers[intent];
  if (handler) {
    await handler(formData);
  } else {
    throw new Response(`Unknown Intent: ${intent}`, { status: 400 });
  }
}

const handlers: Record<string, (formData: FormData) => Promise<void>> = {
  [INTENTS.createTask]: handleCreateTask,
  [INTENTS.toggleCompletion]: handleToggleCompletion,
  [INTENTS.editTask]: handleEditTask,
  [INTENTS.saveTask]: handleSaveTask,
  [INTENTS.deleteTask]: handleDeleteTask,
  [INTENTS.clearCompleted]: handleClearCompleted,
  [INTENTS.deleteAll]: handleDeleteAll,
};

export async function handleCreateTask(formData: FormData) {
  const description = formData.get("description") as string;
  invariant(description, "Description is required");
  await todos.create(description);
}

export async function handleToggleCompletion(formData: FormData) {
  const id = formData.get("id") as string;
  const completed = formData.get("completed") as string;
  await todos.update(id, {
    completed: !JSON.parse(completed),
    completedAt: !JSON.parse(completed) ? new Date().toISOString() : undefined,
  });
}

export async function handleEditTask(formData: FormData) {
  const id = formData.get("id") as string;
  await todos.update(id, { editing: true });
}

export async function handleSaveTask(formData: FormData) {
  const id = formData.get("id") as string;
  const description = formData.get("description") as string;
  await todos.update(id, { description, editing: false });
}

export async function handleDeleteTask(formData: FormData) {
  const id = formData.get("id") as string;
  await todos.delete(id);
}

export async function handleClearCompleted() {
  await todos.clearCompleted();
}

export async function handleDeleteAll() {
  await todos.deleteAll();
}
