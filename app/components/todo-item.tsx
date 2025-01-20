import { useEffect, useState } from "react";
import { useFetcher, useFetchers } from "react-router";
import { INTENTS } from "~/types";
import { SaveIcon } from "./icons";

import {
  CheckCircleIcon,
  CircleIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import type { Task } from "~/drizzle/schema";
import { formatDate } from "~/lib/dates";

export function TodoItem(props: { todo: Task }) {
  const fetcher = useFetcher();
  const fetchers = useFetchers();
  const [isEditing, setIsEditing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editing = isClient ? isEditing : props.todo.editing;

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
      ? new Date().toISOString()
      : props.todo.completedAt;

  const description = isSaving
    ? (fetcher.formData?.get("description") as string)
    : props.todo.description;

  return (
    <li
      className={`my-4 flex gap-4 items-center border-b border-dashed border-gray-200 pb-4 last:border-none last:pb-0 dark:border-gray-700 ${
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
          className="p-1"
        >
          {completed ? (
            <CheckCircleIcon className="size-4 text-sky-500" />
          ) : (
            <CircleIcon className="size-4 text-slate-300 dark:text-slate-500" />
          )}
        </button>
      </fetcher.Form>

      {!editing && (
        <div
          className={`flex-1 space-y-0.5 ${
            completed || actionInProgress ? "opacity-25 dark:opacity-40" : ""
          }`}
        >
          <p className="dark:text-zinc-200 text-zinc-700 text-lg">
            {description}
          </p>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {completed ? (
              <>
                <p>Completed on {formatDate(completedAt)}</p>
              </>
            ) : (
              <p>Created on {formatDate(props.todo.createdAt)}</p>
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
              className="w-full rounded-md p-2 bg-gray-100 dark:bg-slate-700 border border-zinc-200 dark:border-slate-600 text-gray-600 dark:text-slate-200 placeholder-gray-400 text-[16px] font-light focus:outline-none transition-colors"
            />
            <button
              aria-label="SAVE_TASK"
              disabled={actionInProgress}
              name="intent"
              value={INTENTS.saveTask}
              className="rounded-full border border-gray-200 dark:text-gray-400 p-1 transition hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
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
            className="rounded-full border border-gray-200 p-1.5 transition dark:text-gray-400 hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <PencilIcon className="size-3" />
          </button>
        )}
        <button
          aria-label="DELETE_TASK"
          disabled={completed || editing || actionInProgress}
          name="intent"
          value={INTENTS.deleteTask}
          className="rounded-full border border-gray-200 p-1.5 transition dark:text-gray-400 hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <TrashIcon className="size-3" />
        </button>
      </fetcher.Form>
    </li>
  );
}
