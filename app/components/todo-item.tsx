import { useState } from "react";
import { useFetcher, useFetchers } from "react-router";
import { INTENTS, type Item } from "~/types";
import {
  DeleteIcon,
  EditIcon,
  SaveIcon,
  SquareCheckIcon,
  SquareIcon,
} from "./icons";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
  timeZone: "UTC",
});

export function TodoItem(props: { todo: Item }) {
  const fetcher = useFetcher();
  const fetchers = useFetchers();
  const [isEditing, setIsEditing] = useState(false);

  const editing =
    typeof document !== "undefined" ? isEditing : props.todo.editing;

  const isClearingCompleted = fetchers.some(
    (fetcher) =>
      fetcher.state === "submitting" &&
      fetcher.formData?.get("intent") === INTENTS.clearCompleted
  );

  const isDeletingAll = fetchers.some(
    (fetcher) =>
      fetcher.state === "submitting" &&
      fetcher.formData?.get("intent") === INTENTS.deleteAll
  );

  const actionInProgress =
    isDeletingAll || (props.todo.completed && isClearingCompleted);

  const isToggleCompletion =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === INTENTS.toggleCompletion;

  const isSaving =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === INTENTS.saveTask;

  const completed = isToggleCompletion
    ? !JSON.parse(fetcher.formData?.get("completed") as string)
    : props.todo.completed;

  const completedAt =
    isToggleCompletion || !props.todo.completedAt
      ? new Date()
      : props.todo.completedAt;

  const description = isSaving
    ? (fetcher.formData?.get("description") as string)
    : props.todo.description;

  return (
    <li
      className={`my-4 flex gap-4 border-b border-dashed border-gray-200 pb-4 last:border-none last:pb-0 dark:border-gray-700 ${
        editing ? "items-center" : "items-start"
      }`}
    >
      <fetcher.Form method="post">
        <input type="hidden" name="id" value={props.todo.id} />
        <input type="hidden" name="completed" value={`${completed}`} />
        <input
          type="hidden"
          name="completed"
          value={`${props.todo.completed}`}
        />
        <button
          aria-label={`Mark task as ${completed ? "incomplete" : "complete"}`}
          disabled={editing || actionInProgress}
          name="intent"
          value={INTENTS.toggleCompletion}
          className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          {completed ? (
            <SquareCheckIcon className="h-4 w-4" />
          ) : (
            <SquareIcon className="h-4 w-4" />
          )}
        </button>
      </fetcher.Form>

      {!editing && (
        <div
          className={`flex-1 space-y-0.5 ${
            completed || actionInProgress ? "opacity-25" : ""
          }`}
        >
          <p>{description}</p>
          <div className="space-y-0.5 text-xs">
            <p>
              Created at{" "}
              <time
                dateTime={`${new Date(props.todo.createdAt).toISOString()}`}
              >
                {dateFormatter.format(new Date(props.todo.createdAt))}
              </time>
            </p>
            {completed && (
              <p>
                Completed at{" "}
                <time dateTime={`${new Date(completedAt).toISOString()}`}>
                  {dateFormatter.format(new Date(completedAt))}
                </time>
              </p>
            )}
          </div>
        </div>
      )}

      <fetcher.Form
        method="post"
        className={`flex items-center gap-4 ${editing ? "flex-1" : ""}`}
        onSubmit={(event: any) => {
          const submitter = (event.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;

          if (submitter.value === INTENTS.editTask) {
            setIsEditing(true);
            event.preventDefault();
            return;
          }

          if (submitter.value === INTENTS.saveTask) {
            setIsEditing(false);
            return;
          }

          if (
            submitter.value === INTENTS.deleteTask &&
            !confirm("Are you sure you want to delete this task?")
          ) {
            event.preventDefault();
            return;
          }
        }}
      >
        <input type="hidden" name="id" value={props.todo.id} />
        {editing ? (
          <>
            <input
              name="description"
              defaultValue={description}
              required
              className="flex-1 rounded-full border-2 px-3 py-2 text-sm text-black"
            />
            <button
              aria-label="SAVE_TASK"
              disabled={actionInProgress}
              name="intent"
              value={INTENTS.saveTask}
              className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <SaveIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            aria-label="EDIT_TASK"
            disabled={completed || actionInProgress}
            name="intent"
            value={INTENTS.editTask}
            className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <EditIcon className="h-4 w-4" />
          </button>
        )}
        <button
          aria-label="DELETE_TASK"
          disabled={completed || editing || actionInProgress}
          name="intent"
          value={INTENTS.deleteTask}
          className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <DeleteIcon className="h-4 w-4" />
        </button>
      </fetcher.Form>
    </li>
  );
}
