import { useFetcher, useFetchers } from "react-router";
import { INTENTS, type Item } from "~/types";

export function TodoActions(props: { tasks: Item[] }) {
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

  const remainingTaskCount = tasks.reduce((acc, task) => {
    if (!task.completed) {
      return acc + 1;
    }

    return acc;
  }, 0);

  return (
    <div className="flex flex-col items-center justify-between gap-4 text-sm">
      <fetcher.Form
        method="post"
        className="flex items-center gap-4"
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
          className="text-zinc-500 dark:text-sky-400 underline underline-offset-2 text-xs transition disabled:pointer-events-none disabled:opacity-25"
        >
          {isClearingCompleted ? "Clearing..." : "Clear Completed"}
        </button>
        <button
          disabled={tasks.length === 0 || isDeletingAll}
          name="intent"
          value={INTENTS.deleteAll}
          className="text-zinc-500 dark:text-sky-400 underline underline-offset-2 text-xs transition disabled:pointer-events-none disabled:opacity-25"
        >
          {isDeletingAll ? "Deleting..." : "Delete All"}
        </button>
      </fetcher.Form>
    </div>
  );
}
