import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useRef } from "react";
import {
  Form,
  redirect,
  useFetchers,
  useSearchParams,
  useSubmit,
} from "react-router";
import invariant from "tiny-invariant";
import { ProfileMenu } from "~/components/profile-menu";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { TodoActions } from "~/components/todo-actions";
import { TodoList } from "~/components/todo-list";
import type { Task } from "~/drizzle/schema";
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

  return {
    id: userQuery.data.user.id.toString(),
    name: userQuery.data.user.name,
    email: userQuery.data.user.email,
    tasks: userQuery.data.user.tasks,
  };
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
      const id = formData.get("id") as string;
      invariant(description, "Description is required");
      await createTask(id, userId, description);
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

  return { ok: true };
}

export default function Home(props: Route.ComponentProps) {
  const data = props.loaderData;
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const view = (searchParams.get("view") || "all") as View;

  const addFormRef = useRef<HTMLFormElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const pendingTasks = usePendingTasks();
  const pendingCompletions = usePendingTaskCompletion();

  const tasks = useMemo(() => {
    const taskMap = new Map<string, Task>(
      data.tasks.map((task: Task) => [task.id, task])
    );

    pendingTasks.forEach((pendingTask) => {
      if (!taskMap.has(pendingTask.id)) {
        taskMap.set(pendingTask.id, {
          ...pendingTask,
          userId: "",
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
          editing: false,
        });
      }
    });

    pendingCompletions.forEach((pendingCompletion) => {
      const task = taskMap.get(pendingCompletion.id);
      if (task) {
        taskMap.set(pendingCompletion.id, {
          ...task,
          completed: pendingCompletion.completed,
          completedAt: pendingCompletion.completedAt || "",
        });
      }
    });

    return taskMap;
  }, [data.tasks, pendingTasks, pendingCompletions]);

  const completedTasks = [...tasks.values()].filter(
    (task) => task.completed
  ).length;
  const totalTasks = tasks.size;
  const percentComplete =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-serif text-slate-800 dark:text-white">
          Things
        </h1>
        <div className="flex space-x-4 items-center">
          <ThemeSwitcher />
          <ProfileMenu />
        </div>
      </div>

      <div className="h-2 mb-6 rounded-md bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className="h-full bg-teal-400 dark:bg-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentComplete}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <Form className="flex gap-2">
          {(["all", "active", "completed"] as const).map((option) => (
            <button
              key={option}
              name="view"
              value={option}
              className={`px-3 rounded-full py-1 text-sm capitalize transition-colors ${
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

      <Form
        ref={addFormRef}
        method="post"
        className="relative mb-8"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const id = crypto.randomUUID();
          formData.set("id", id);

          submit(formData, {
            method: "post",
            navigate: false,
            flushSync: true,
          });

          invariant(addInputRef.current);
          addInputRef.current.value = "";
        }}
      >
        <input type="hidden" name="intent" value={INTENTS.createTask} />
        <input
          ref={addInputRef}
          type="text"
          name="description"
          required
          placeholder="Add a new task..."
          className="w-full px-4 py-3 rounded-md text-lg font-serif bg-white dark:bg-slate-800 border border-rose-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 dark:text-white"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5 text-slate-600" />
        </button>
      </Form>

      <TodoList todos={[...tasks.values()]} view={view} />
    </div>
  );
}

function usePendingTaskCompletion() {
  type PendingTask = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is PendingTask => {
      if (!fetcher.formData) return false;
      const intent = fetcher.formData.get("intent");
      return intent === INTENTS.toggleCompletion;
    })
    .map((fetcher) => {
      const id = String(fetcher.formData.get("id"));
      const completed = String(fetcher.formData.get("completed"));
      return {
        id,
        completed: !JSON.parse(completed),
        completedAt: !JSON.parse(completed)
          ? new Date().toISOString()
          : undefined,
      };
    });
}

function usePendingTasks() {
  type PendingTask = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is PendingTask => {
      if (!fetcher.formData) return false;
      const intent = fetcher.formData.get("intent");
      return intent === INTENTS.createTask;
    })
    .map((fetcher) => {
      const description = String(fetcher.formData.get("description"));
      const id = String(fetcher.formData.get("id"));
      return {
        id,
        description,
        createdAt: new Date().toISOString(),
      };
    });
}
