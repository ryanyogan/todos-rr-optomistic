import { useFetcher, useFetchers } from "react-router";
import { INTENTS } from "~/types";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import type { Task } from "~/drizzle/schema";

export function TodoItem(props: { todo: Task }) {
  const fetcher = useFetcher();
  const fetchers = useFetchers();

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
    <motion.div
      key={props.todo.id}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-start gap-4 p-4 mb-3 bg-white/30 dark:bg-slate-500/10 hover:bg-white/70 rounded-lg shadow-sm dark:hover:bg-slate-500/20 transition-shadow"
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
          disabled={actionInProgress}
          name="intent"
          value={INTENTS.toggleCompletion}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            completed
              ? "bg-teal-500 border-teal-500"
              : "border-slate-300 dark:border-slate-600"
          }`}
        >
          {completed && <Check className="w-3 h-3 text-white" />}
        </button>
      </fetcher.Form>
      <div className="flex-1 min-w-0">
        <p
          className={`text-slate-700 dark:text-slate-200 break-words font-serif ${
            completed ? "line-through text-slate-400 dark:text-slate-500" : ""
          }`}
        >
          {description}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {completed
            ? `Completed ${format(completedAt, "MMM d, yyyy")}`
            : `Created ${format(props.todo.createdAt, "MMM d, yyyy")}`}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <fetcher.Form
          method="post"
          className={`flex items-center gap-4`}
          onSubmit={(event: any) => {
            const submitter = (event.nativeEvent as SubmitEvent)
              .submitter as HTMLButtonElement;

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
          <button
            aria-label="DELETE_TASK"
            disabled={completed || actionInProgress}
            name="intent"
            value={INTENTS.deleteTask}
            className="p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </fetcher.Form>
      </div>
    </motion.div>
  );
}
