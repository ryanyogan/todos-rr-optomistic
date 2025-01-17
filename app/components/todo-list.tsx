import { useMemo } from "react";
import type { Item, View } from "~/types";
import { TodoItem } from "./todo-item";

export function TodoList(props: { todos: Item[]; view: View }) {
  const visibleTodos = useMemo(() => {
    return props.todos.filter((todo) => {
      return props.view === "active"
        ? !todo.completed
        : props.view === "completed"
        ? todo.completed
        : true;
    });
  }, [props.todos, props.view]);

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
