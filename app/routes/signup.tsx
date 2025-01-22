import { Loader2 } from "lucide-react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { createUser } from "~/lib/auth.server";
import { validateForm } from "~/lib/validations";
import type { Route } from "./+types/signup";

export const meta = () => {
  return [
    { title: "Sign Up | Todo App" },
    {
      name: "description",
      content: "Create an account to manage your tasks efficiently.",
    },
  ];
};

export async function action(props: Route.ActionArgs) {
  const formData = await props.request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const formError = validateForm({ name, email, password });
  if (formError) {
    return { errors: formError };
  }

  const userCreation = await createUser(name, email, password);
  if (userCreation.error) {
    return { errors: { result: userCreation.error } };
  }

  return redirect("/signin");
}

export default function Signup(props: Route.ComponentProps) {
  const actionData = props.actionData;
  const navigation = useNavigation();

  const isSubmitting = navigation.formAction === "/signup";
  const errors = isSubmitting ? {} : actionData?.errors;

  return (
    <div className="h-[calc(100dvh-100px)] w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center mb-12 text-slate-800 dark:text-slate-200">
          Sign Up
        </h1>

        <Form method="post" className="space-y-6">
          <fieldset disabled={isSubmitting}>
            <div className="space-y-2">
              <input
                type="text"
                name="name"
                id="name"
                minLength={2}
                placeholder="Create a new name..."
                required
                className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 dark:text-white"
              />
              {errors?.name && (
                <p className="flex items-center text-sm font-medium leading-5 text-red-500">
                  {errors.name}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset disabled={isSubmitting}>
            <div className="space-y-2">
              <input
                name="email"
                id="email"
                autoComplete="email"
                inputMode="email"
                type="email"
                required
                placeholder="Enter your email..."
                className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 dark:text-white"
              />
              {errors?.email && (
                <p className="flex items-center text-sm font-medium leading-5 text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset disabled={isSubmitting}>
            <div className="space-y-2">
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="new-password"
                placeholder="Enter your password..."
                className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 dark:text-white"
              />
              {errors?.password && (
                <p className="flex items-center text-sm font-medium leading-5 text-red-500">
                  {errors.password}
                </p>
              )}
            </div>
          </fieldset>

          <div className="flex justify-between items-center pt-4">
            <span className="text-xs text-slate-500">
              <Link
                to="/signin"
                className="hover:text-slate-800 transition-colors"
              >
                Already have an account?
              </Link>
            </span>

            <button
              type="submit"
              className="px-6 py-2 text-gray-600 dark:text-slate-200 rounded-md border border-rose-200 text-sm font-sans hover:bg-gray-100 hover:dark:bg-gray-600 transition-colors focus:outline-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
          {errors?.result && (
            <output className="mt-6 block text-center text-sm font-medium leading-5 text-red-500">
              {errors.result}
            </output>
          )}
        </Form>

        <div className="mt-16 text-center">
          <span className="text-xs text-gray-400">
            Built by{" "}
            <a
              href="https://github.com/yourusername"
              className="text-gray-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ryan Yogan
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
