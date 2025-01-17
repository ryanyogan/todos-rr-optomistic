import type { Item } from "~/types";
import { TodoItem } from "./todo-item";

export function TodoList(props: { todos: Item[] }) {
  return (
    <ul>
      {props.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
