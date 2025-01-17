import { useState } from "react";
import { useFetcher } from "react-router";
import type { Item } from "~/types";
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
  const [isEditing, setIsEditing] = useState(false);

  const editing =
    typeof document !== "undefined" ? isEditing : props.todo.editing;

  return (
    <li
      className={`my-4 flex gap-4 border-b border-dashed border-gray-200 pb-4 last:border-none last:pb-0 dark:border-gray-700 ${
        editing ? "items-center" : "items-start"
      }`}
    >
      <fetcher.Form method="post">
        <input type="hidden" name="id" value={props.todo.id} />
        <input
          type="hidden"
          name="completed"
          value={`${props.todo.completed}`}
        />
        <button
          aria-label={`Mark task as ${
            props.todo.completed ? "incomplete" : "complete"
          }`}
          disabled={editing}
          name="intent"
          value="TOGGLE_COMPLETION"
          className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          {props.todo.completed ? (
            <SquareCheckIcon className="h-4 w-4" />
          ) : (
            <SquareIcon className="h-4 w-4" />
          )}
        </button>
      </fetcher.Form>

      {!editing && (
        <div
          className={`flex-1 space-y-0.5 ${
            props.todo.completed ? "opacity-25" : ""
          }`}
        >
          <p>{props.todo.description}</p>
          <div className="space-y-0.5 text-xs">
            <p>
              Created at{" "}
              <time
                dateTime={`${new Date(props.todo.createdAt).toISOString()}`}
              >
                {dateFormatter.format(new Date(props.todo.createdAt))}
              </time>
            </p>
            {props.todo.completed && (
              <p>
                Completed at{" "}
                <time
                  dateTime={`${new Date(
                    props.todo.completedAt!
                  ).toISOString()}`}
                >
                  {dateFormatter.format(new Date(props.todo.completedAt!))}
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

          if (submitter.value === "EDIT_TASK") {
            setIsEditing(true);
            event.preventDefault();
            return;
          }

          if (submitter.value === "SAVE_TASK") {
            setIsEditing(false);
            return;
          }

          if (
            submitter.value === "DELETE_TASK" &&
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
              defaultValue={props.todo.description}
              required
              className="flex-1 rounded-full border-2 px-3 py-2 text-sm text-black"
            />
            <button
              aria-label="SAVE_TASK"
              name="intent"
              value="SAVE_TASK"
              className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <SaveIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            aria-label="EDIT_TASK"
            disabled={props.todo.completed}
            name="intent"
            value="EDIT_TASK"
            className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <EditIcon className="h-4 w-4" />
          </button>
        )}
        <button
          aria-label="DELETE_TASK"
          disabled={props.todo.completed || editing}
          name="intent"
          value="DELETE_TASK"
          className="rounded-full border border-gray-200 p-1 transition hover:bg-gray-200 disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <DeleteIcon className="h-4 w-4" />
        </button>
      </fetcher.Form>
    </li>
  );
}
