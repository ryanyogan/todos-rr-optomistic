import { Circle, Trash2 } from "lucide-react";
import { useFetcher, useFetchers } from "react-router";
import type { Task } from "~/drizzle/schema";
import { INTENTS } from "~/types";

export function TodoActions(props: { tasks: Task[] }) {
  const fetcher = useFetcher();
  const fetchers = useFetchers();

  const isClearingCompleted =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === INTENTS.clearCompleted;

  const isDeletingAll =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === INTENTS.deleteAll;

  const isTogglingCompletion = fetchers.some(
    (fetcher) =>
      fetcher.state !== "idle" &&
      fetcher.formData?.get("intent") === INTENTS.toggleCompletion
  );

  const isDeleting = fetchers.some(
    (fetcher) =>
      fetcher.state !== "idle" &&
      fetcher.formData?.get("intent") === INTENTS.deleteTask
  );

  const completingTodoIds = fetchers
    .filter(
      (fetcher) =>
        fetcher.state !== "idle" &&
        fetcher.formData?.get("intent") === INTENTS.toggleCompletion
    )
    .map((fetcher) => ({
      id: fetcher.formData?.get("id"),
      completed: fetcher.formData?.get("completed"),
    }));

  const deletingTodoIds = fetchers
    .filter(
      (fetcher) =>
        fetcher.state !== "idle" &&
        fetcher.formData?.get("intent") === INTENTS.deleteTask
    )
    .map((fetcher) => fetcher.formData?.get("id"));

  let tasks = isTogglingCompletion
    ? props.tasks.map((task) => {
        const completingTodo = completingTodoIds.find(
          (todo) => todo.id === task.id
        );

        if (completingTodo) {
          task.completed = !JSON.parse(completingTodo.completed as string);
        }

        return task;
      })
    : props.tasks;

  tasks = isDeleting
    ? tasks.filter((task) => !deletingTodoIds.includes(task.id))
    : tasks;

  return (
    <div className="flex gap-2 text-sm">
      <fetcher.Form
        method="post"
        className="flex gap-x-2 text-sm"
        onSubmit={(event) => {
          const submitter = (event.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;

          if (
            submitter.value === INTENTS.clearCompleted &&
            !confirm("Are you sure you want to clear all completed tasks?")
          ) {
            event.preventDefault();
            return;
          } else if (
            submitter.value === INTENTS.deleteAll &&
            !confirm("Are you sure you want to delete all tasks?")
          ) {
            event.preventDefault();
            return;
          }
        }}
      >
        <button
          disabled={
            !tasks.some((todo) => todo.completed) || isClearingCompleted
          }
          name="intent"
          value={INTENTS.clearCompleted}
          className="text-slate-600 flex items-center text-xs dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          {isClearingCompleted ? (
            <Circle className="size-3 animate-spin mr-1" />
          ) : (
            <Trash2 className="size-3 mr-1" />
          )}
          <span>Completed</span>
        </button>
        <button
          disabled={tasks.length === 0 || isDeletingAll}
          name="intent"
          value={INTENTS.deleteAll}
          className="text-slate-600 flex space-x-3 items-center text-xs dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          {isDeletingAll ? (
            <Circle className="size-3 animate-spin mr-1" />
          ) : (
            <Trash2 className="size-3 mr-1" />
          )}{" "}
          All
        </button>
      </fetcher.Form>
    </div>
  );
}
