import { useEffect, useRef } from "react";
import { data, Form, Link, useFetcher, useSearchParams } from "react-router";
import invariant from "tiny-invariant";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { TodoActions } from "~/components/todo-actions";
import { TodoList } from "~/components/todo-list";
import { todos } from "~/lib/db.server";
import { executeHandler } from "~/lib/tasks";
import { INTENTS, type View } from "~/types";
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

  await executeHandler(intent, formData);

  return data({ ok: true });
}

export default function Home(props: Route.ComponentProps) {
  const data = props.loaderData;
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "all";

  const addFormRef = useRef<HTMLFormElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const isAdding =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === INTENTS.createTask;

  useEffect(() => {
    if (!isAdding) {
      addFormRef.current?.reset();
      addInputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div className="flex flex-1 flex-col md:mx-auto md:w-[720px]">
      <header className="mb-12 flex items-center justify-between">
        <h1 className="font-thin text-5xl dark:text-zinc-100">Things</h1>
        <ThemeSwitcher />
      </header>

      <main className="flex-1 space-y-8">
        <fetcher.Form
          ref={addFormRef}
          method="post"
          className="border border-zinc-200 bg-white/90 dark:border-gray-700 dark:bg-gray-900"
        >
          <fieldset
            disabled={isAdding}
            className="flex items-center gap-2 p-2 text-sm disabled:pointer-events-none disabled:opacity-25"
          >
            <input
              ref={addInputRef}
              type="text"
              name="description"
              placeholder="Create a new todo..."
              required
              className="flex-1 border border-zinc-200 px-3 py-2 text-sm placeholder:font-thin text-zinc-900 dark:border-white/50"
            />
            <button
              name="intent"
              value={INTENTS.createTask}
              className="border border-zinc-200 px-3 bg-zinc-300/20 dark:bg-zinc-800 dark:border-zinc-700 py-1.5 text-base font-thin transition hover:border-gray-500 sm:px-6"
            >
              {isAdding ? "Adding..." : "Add"}
            </button>
          </fieldset>
        </fetcher.Form>

        <div className="border border-zinc-200 bg-white/90 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          {data.tasks.length > 0 ? (
            <ul>
              <TodoList todos={data.tasks} view={view as View} />
            </ul>
          ) : (
            <p className="text-center leading-7">No tasks available</p>
          )}
        </div>

        <div className="border border-zinc-200 bg-white/90 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          <TodoActions tasks={data.tasks} />
        </div>

        <div className="border border-zinc-200 bg-white/90 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
          <Form className="flex items-center justify-center gap-12 text-sm">
            <button
              name="view"
              value="all"
              aria-label="View all tasks"
              className={`transition ${
                view === "all" ? "font-bold" : "opacity-50 hover:opacity-100"
              }`}
            >
              All
            </button>
            <button
              name="view"
              value="active"
              aria-label="View active tasks"
              className={`transition ${
                view === "active" ? "font-bold" : "opacity-50 hover:opacity-100"
              }`}
            >
              Active
            </button>
            <button
              name="view"
              value="completed"
              aria-label="View completed"
              className={`transition ${
                view === "completed"
                  ? "font-bold"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              Completed
            </button>
          </Form>
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
