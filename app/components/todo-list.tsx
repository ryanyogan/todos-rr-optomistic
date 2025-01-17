import { useMemo } from "react";
import { useFetchers } from "react-router";
import type { Item, View } from "~/types";
import { TodoItem } from "./todo-item";

export function TodoList(props: { todos: Item[]; view: View }) {
  const fetchers = useFetchers();

  const isDeleting = fetchers.some(
    (fetcher) =>
      fetcher.state !== "idle" &&
      fetcher.formData?.get("intent") === "DELETE_TASK"
  );

  const deltingTodoIds = fetchers
    .filter(
      (fetcher) =>
        fetcher.state !== "idle" &&
        fetcher.formData?.get("intent") === "DELETE_TASK"
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

  if (visibleTodos.length === 0) {
    return (
      <p className="text-center leading-7">
        {props.view === "all"
          ? "No tasks available"
          : props.view === "active"
          ? "No active tasks"
          : "No completed tasks"}
      </p>
    );
  }

  return (
    <ul>
      {visibleTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
