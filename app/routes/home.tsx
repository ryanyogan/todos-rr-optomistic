import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  data,
  Form,
  redirect,
  useFetcher,
  useSearchParams,
} from "react-router";
import invariant from "tiny-invariant";
import { ProfileMenu } from "~/components/profile-menu";
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl sm:text-5xl font-serif text-slate-800 dark:text-white">
          Things
        </h1>

        <div className="flex space-x-4 items-center">
          <ThemeSwitcher />
          <ProfileMenu />
        </div>
      </div>

      <fetcher.Form ref={addFormRef} method="post" className="relative mb-6">
        <input type="hidden" name="intent" value={INTENTS.createTask} />
        <input
          ref={addInputRef}
          type="text"
          name="description"
          disabled={isAdding}
          required
          placeholder="Add a new task..."
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 dark:text-white"
        />
        <button
          disabled={isAdding}
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5 text-teal-500" />
        </button>
      </fetcher.Form>

      <motion.div
        className="h-1 mb-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="h-full bg-teal-400 dark:bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentComplete}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <Form className="flex gap-2">
          {(["all", "active", "completed"] as const).map((option) => (
            <button
              key={option}
              name="view"
              value={option}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                view === option
                  ? "bg-slate-800 text-white dark:bg-white dark:text-slate-800"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </Form>
        <TodoActions tasks={data.tasks} />
      </div>

      <TodoList todos={data.tasks} view={view as View} />
    </div>
  );
}
