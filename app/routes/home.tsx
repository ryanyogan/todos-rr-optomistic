import { ListCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  data,
  Link,
  redirect,
  useFetcher,
  useSearchParams,
} from "react-router";
import invariant from "tiny-invariant";
import { ProfileMenu } from "~/components/profile-menu";
import { StateSelector } from "~/components/state-selector";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { TodoActions } from "~/components/todo-actions";
import { TodoList } from "~/components/todo-list";
import { getUser } from "~/lib/auth.server";
import { destroySession, getSession } from "~/lib/session.server";
import { INTENTS, type View } from "~/types";
import type { Route } from "./+types/home";
import {
  clearCompleted,
  createTask,
  deleteAll,
  deleteTask,
  updateTask,
} from "./queries/tasks";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Things" },
    { name: "description", content: "Learn React Router with Things!" },
  ];
}

export async function loader(props: Route.LoaderArgs) {
  const session = await getSession(props.request.headers.get("Cookie"));
  if (!session.has("id")) {
    throw redirect("/signin", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const userQuery = await getUser(session.get("id") as string);
  if (userQuery.error || !userQuery.data) {
    throw redirect("/signin");
  }

  return data({
    id: userQuery.data.user.id.toString(),
    name: userQuery.data.user.name,
    email: userQuery.data.user.email,
    tasks: userQuery.data.user.tasks,
  });
}

export async function action(props: Route.ActionArgs) {
  const session = await getSession(props.request.headers.get("Cookie"));
  const formData = await props.request.formData();
  const userId = session.get("id") as string;
  invariant(userId, "User ID is required");

  const intent = formData.get("intent") as string;
  invariant(intent, "Intent is required");

  switch (intent) {
    case INTENTS.createTask: {
      const description = formData.get("description") as string;
      invariant(description, "Description is required");
      await createTask(userId, description);
      break;
    }

    case INTENTS.toggleCompletion: {
      const id = formData.get("id") as string;
      const completed = formData.get("completed") as string;
      await updateTask(userId, id, {
        completed: !JSON.parse(completed),
        completedAt: !JSON.parse(completed)
          ? new Date().toISOString()
          : undefined,
      });
      break;
    }

    case INTENTS.editTask: {
      const id = formData.get("id") as string;
      await updateTask(userId, id, { editing: true });
      break;
    }

    case INTENTS.saveTask: {
      const id = formData.get("id") as string;
      const description = formData.get("description") as string;
      await updateTask(userId, id, { description, editing: false });
      break;
    }

    case INTENTS.deleteTask: {
      const id = formData.get("id") as string;
      await deleteTask(userId, id);
      break;
    }

    case INTENTS.clearCompleted: {
      await clearCompleted(userId);
      break;
    }

    case INTENTS.deleteAll: {
      await deleteAll(userId);
      break;
    }

    default: {
      throw new Response("Invalid intent", { status: 400 });
    }
  }

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

  const completedTasks = data.tasks.filter((task) => task.completed).length;
  const totalTasks = data.tasks.length;
  const percentComplete =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col md:mx-auto md:w-[720px]">
      <header className="mb-12 flex items-center justify-between px-2">
        <Link to="/">
          <h1 className="font-serif tracking-wide font-light text-5xl dark:text-zinc-100">
            Things
          </h1>
        </Link>
        <div className="flex justify-between gap-x-4">
          <ThemeSwitcher />
          <ProfileMenu />
        </div>
      </header>

      <main className="flex-1 space-y-4">
        <div className="px-2 py-2 flex items-center gap-x-4">
          <StateSelector />
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="dark:bg-blue-500 bg-green-500 h-2 rounded-full"
              style={{ width: `${percentComplete}%` }}
            ></div>
            <div className="w-full flex justify-end text-[12px]">
              <p className="dark:text-slate-600 text-slate-500">
                {completedTasks} of {totalTasks} completed
              </p>
            </div>
          </div>
        </div>

        <fetcher.Form ref={addFormRef} method="post" className="">
          <fieldset
            disabled={isAdding}
            className="flex items-center gap-2 p-2 text-sm disabled:pointer-events-none"
          >
            <input type="hidden" name="intent" value={INTENTS.createTask} />
            <input
              ref={addInputRef}
              type="text"
              name="description"
              placeholder="Create a new todo..."
              required
              className="w-full rounded-md p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-gray-800 dark:text-slate-200 placeholder:text-slate-500 placeholder:dark:text-slate-400 text-[16px] font-light focus:outline-none transition-colors"
            />
          </fieldset>
        </fetcher.Form>

        <div className="px-2 py-2">
          {data.tasks.length > 0 ? (
            <ul>
              <TodoList todos={data.tasks} view={view as View} />
            </ul>
          ) : (
            <div className="flex flex-col">
              <ListCheck className="mx-auto w-16 h-16 text-slate-500 dark:text-slate-500" />
              <p className="text-center font-serif text-lg font-light text-slate-500">
                No tasks available
              </p>
            </div>
          )}
        </div>

        <div className="px-2 py-2">
          <TodoActions tasks={data.tasks} />
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
