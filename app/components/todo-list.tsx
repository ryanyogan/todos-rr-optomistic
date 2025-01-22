import { AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { useFetchers } from "react-router";
import type { Task } from "~/drizzle/schema";
import { INTENTS, type View } from "~/types";
import { TodoItem } from "./todo-item";

export function TodoList(props: { todos: Task[]; view: View }) {
  const fetchers = useFetchers();

  const isDeleting = fetchers.some(
    (fetcher) =>
      fetcher.state !== "idle" &&
      fetcher.formData?.get("intent") === INTENTS.deleteTask
  );

  const deltingTodoIds = fetchers
    .filter(
      (fetcher) =>
        fetcher.state !== "idle" &&
        fetcher.formData?.get("intent") === INTENTS.deleteTask
    )
    .map((fetcher) => fetcher.formData?.get("id"));

  const visibleTodos = useMemo(() => {
    let filteredTodos = props.todos.filter((todo) => {
      return props.view === "active"
        ? !todo.completed
        : props.view === "completed"
        ? todo.completed
        : true;
    });

    if (isDeleting) {
      filteredTodos = filteredTodos.filter(
        (todo) => !deltingTodoIds.includes(todo.id)
      );
    }

    return filteredTodos;
  }, [props.todos, props.view, deltingTodoIds, isDeleting]);

  const completedTaskCount = visibleTodos.reduce((acc, task) => {
    if (task.completed) {
      return acc + 1;
    }

    return acc;
  }, 0);

  if (visibleTodos.length === 0) {
    return (
      <p className="text-center text-slate-700 text-sm font-serif dark:text-slate-400">
        {props.view === "all"
          ? "No tasks available"
          : props.view === "active"
          ? "No active tasks"
          : "No completed tasks"}
      </p>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {visibleTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {props.todos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 dark:text-slate-500">
            No tasks yet. Add one to get started!
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>
          {completedTaskCount} of {visibleTodos.length} tasks completed
        </p>
      </footer>
    </div>
  );
}
