import { data, Link, useFetcher } from "react-router";
import invariant from "tiny-invariant";
import { TodoList } from "~/components/todo-list";
import { todos } from "~/lib/db.server";
import type { Route } from "./+types/home";

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
    case "CREATE_TASK": {
      const description = formData.get("description") as string;
      invariant(description, "Description is required");

      await todos.create(description);
      break;
    }

    case "TOGGLE_COMPLETION": {
      const id = formData.get("id") as string;
      const completed = formData.get("completed") as string;

      await todos.update(id, {
        completed: !JSON.parse(completed),
        completedAt: !JSON.parse(completed) ? new Date() : undefined,
      });
      break;
    }

    case "EDIT_TASK": {
      const id = formData.get("id") as string;

      await todos.update(id, { editing: true });
      break;
    }

    case "SAVE_TASK": {
      const id = formData.get("id") as string;
      const description = formData.get("description") as string;

      await todos.update(id, { description, editing: false });
      break;
    }

    case "DELETE_TASK": {
      const id = formData.get("id") as string;

      await todos.delete(id);
      break;
    }

    default: {
      throw new Response(`Unknown Intent: ${intent}`, { status: 400 });
    }
  }

  return data({ ok: true });
}

export default function Home(props: Route.ComponentProps) {
  const data = props.loaderData;
  const fetcher = useFetcher();

  return (
    <div className="flex flex-1 flex-col md:mx-auto md:w-[720px]">
      <header className="mb-12 flex items-center justify-between">
        <h1 className="text-4xl font-thin lg:text-5xl font-serif">Things</h1>
        <select className="appearance-none border border-gray-300 cursor-pointer bg-gray-50 px-4 py-2 rounded-sm dark:border-gray-700 dark:bg-gray-900">
          <option>System</option>
          <option>Light</option>
          <option>Dark</option>
        </select>
      </header>

      <main className="flex-1 space-y-8">
        <fetcher.Form
          method="post"
          className="border border-gray-300 bg-white/90 dark:border-gray-700 dark:bg-gray-900"
        >
          <fieldset className="flex items-center gap-2 p-2 text-sm">
            <input
              type="text"
              name="description"
              placeholder="Create a new todo..."
              required
              className="flex-1 border border-gray-200 px-3 py-2 text-sm font-bold text-black dark:border-white/50"
            />
            <button
              name="intent"
              value="CREATE_TASK"
              className="border border-gray-300 px-3 bg-zinc-300/40 py-1.5 text-base font-black transition hover:border-gray-500 sm:px-6"
            >
              Add
            </button>
          </fieldset>
        </fetcher.Form>

        <div className="border border-gray-300 bg-white/90 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          {data.tasks.length > 0 ? (
            <ul>
              <TodoList todos={data.tasks} />
            </ul>
          ) : (
            <p className="text-center leading-7">No tasks available</p>
          )}
        </div>

        <div className="border border-gray-300 bg-white/90 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="text-center leading-7">
              {data.tasks.length} {data.tasks.length === 1 ? "item" : "items"}{" "}
              left
            </p>
            <div className="flex items-center gap-4">
              <button className="text-red-400 transition hover:text-red-600">
                Clear Completed
              </button>
              <button className="text-red-400 transition hover:text-red-600">
                Delete All
              </button>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 bg-white/90 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-center gap-12 text-sm">
            <button
              aria-label="View all tasks"
              className="opacity-50 transition hover:opacity-100"
            >
              All
            </button>
            <button
              aria-label="View active tasks"
              className="opacity-50 transition hover:opacity-100"
            >
              Active
            </button>
            <button
              aria-label="View completed"
              className="opacity-50 transition hover:opacity-100"
            >
              Completed
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-12">
        <p className="text-center text-sm leading-loose">
          Built by{" "}
          <Link
            to="https://ryanyogan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative font-medium text-slate-400 after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full dark:text-blue-500 dark:after:bg-blue-500"
          >
            Ryan Yogan
          </Link>
          . The source code is available on{" "}
          <Link
            to="https://github.com/ryanyogan/rr-todo"
            target="_blank"
            rel="noopener noreferrer"
            className="relative font-medium text-slate-400 after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full dark:text-blue-500 dark:after:bg-blue-500"
          >
            GitHub
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
