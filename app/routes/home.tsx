import { useEffect, useRef } from "react";
import { data, Form, Link, useFetcher, useSearchParams } from "react-router";
import invariant from "tiny-invariant";
import { ProfileMenu } from "~/components/profile-menu";
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
      <header className="mb-12 flex items-center justify-between px-1.5">
        <h1 className="font-sans tracking-wide font-light text-4xl dark:text-zinc-100">
          Things
        </h1>
        <div className="flex justify-end">
          <ProfileMenu />
        </div>
      </header>

      <main className="flex-1 space-y-4">
        <fetcher.Form ref={addFormRef} method="post" className="">
          <fieldset
            disabled={isAdding}
            className="flex items-center gap-2 p-2 text-sm disabled:pointer-events-none disabled:opacity-25"
          >
            <input type="hidden" name="intent" value={INTENTS.createTask} />
            <input
              ref={addInputRef}
              type="text"
              name="description"
              placeholder="Create a new todo..."
              required
              className="w-full p-3 bg-gray-50 border border-zinc-200 text-gray-600 placeholder-gray-400 text-[16px] font-light focus:outline-none transition-colors"
            />
          </fieldset>
        </fetcher.Form>

        <div className="px-4 py-2">
          <Form className="flex items-center justify-center gap-12 text-sm dark:text-sky-400">
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

        <div className="px-4 py-2">
          {data.tasks.length > 0 ? (
            <ul>
              <TodoList todos={data.tasks} view={view as View} />
            </ul>
          ) : (
            <p className="text-center leading-7">No tasks available</p>
          )}
        </div>

        <div className="px-4 py-2">
          <TodoActions tasks={data.tasks} />
        </div>

        <div className="w-full flex justify-center p-8">
          <ThemeSwitcher />
        </div>
      </main>

      <footer className="mt-12">
        <p className="text-center text-sm leading-loose dark:text-slate-500">
          Built by{" "}
          <Link
            to="https://ryanyogan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="relative font-medium text-slate-400  after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full dark:text-blue-500 dark:after:bg-blue-500"
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
