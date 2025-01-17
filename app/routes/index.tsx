import { data } from "react-router";
import invariant from "tiny-invariant";
import { todos } from "~/lib/db.server";
import { INTENTS } from "~/types";
import type { Route } from "./+types/home";
import { Home } from "./components/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Things" },
    { name: "description", content: "Learn React Router with Things!" },
  ];
}

export async function loader() {
  return data({ tasks: await todos.read() });
}

export async function action(props: Route.ActionArgs) {
  const formData = await props.request.formData();
  const intent = formData.get("intent") as string;
  invariant(intent, "Intent is required");

  switch (intent) {
    case INTENTS.createTask: {
      const description = formData.get("description") as string;
      invariant(description, "Description is required");

      await todos.create(description);
      break;
    }

    case INTENTS.toggleCompletion: {
      const id = formData.get("id") as string;
      const completed = formData.get("completed") as string;

      await todos.update(id, {
        completed: !JSON.parse(completed),
        completedAt: !JSON.parse(completed) ? new Date() : undefined,
      });
      break;
    }

    case INTENTS.editTask: {
      const id = formData.get("id") as string;

      await todos.update(id, { editing: true });
      break;
    }

    case INTENTS.saveTask: {
      const id = formData.get("id") as string;
      const description = formData.get("description") as string;

      await todos.update(id, { description, editing: false });
      break;
    }

    case INTENTS.deleteTask: {
      const id = formData.get("id") as string;

      await todos.delete(id);
      break;
    }

    case INTENTS.clearCompleted: {
      await todos.clearCompleted();
      break;
    }

    case INTENTS.deleteAll: {
      await todos.deleteAll();
      break;
    }

    default: {
      throw new Response(`Unknown Intent: ${intent}`, { status: 400 });
    }
  }

  return data({ ok: true });
}

export { Home as default };
