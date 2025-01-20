export type View = "all" | "active" | "completed";

export type Theme = "system" | "light" | "dark";

export const INTENTS = {
  createTask: "CREATE_TASK" as const,
  toggleCompletion: "TOGGLE_COMPLETION" as const,
  editTask: "EDIT_TASK" as const,
  saveTask: "SAVE_TASK" as const,
  deleteTask: "DELETE_TASK" as const,
  clearCompleted: "CLEAR_COMPLETED" as const,
  deleteAll: "DELETE_ALL" as const,
};
