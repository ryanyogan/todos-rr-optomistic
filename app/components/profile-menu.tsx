import { LogOutIcon } from "lucide-react";
import { useRef } from "react";
import { Form, useRouteLoaderData } from "react-router";

import type { loader as homeLoader } from "~/routes/home";

export function ProfileMenu() {
  const indexLoaderData = useRouteLoaderData<typeof homeLoader>("routes/home");

  const detailsRef = useRef<HTMLDetailsElement>(null);

  // const name = indexLoaderData?.name as string;
  // const email = indexLoaderData?.email as string;
  const name = "John Doe";
  const email = "joe@doe.com";

  return (
    <details ref={detailsRef} className="group relative cursor-pointer">
      <summary
        role="button"
        aria-haspopup="menu"
        aria-label="Open profile menu"
        tabIndex={0}
        className="flex rounded-md dark:text-zinc-300 items-center justify-between border border-gray-200 bg-gray-50 px-4 py-2 transition hover:border-gray-500 group-open:before:fixed group-open:before:inset-0 group-open:before:cursor-auto dark:border-gray-700 dark:bg-slate-800 [&::-webkit-details-marker]:hidden"
      >
        {name[0].toUpperCase()}
      </summary>

      <div
        role="menu"
        aria-roledescription="Profile menu"
        className="absolute right-0 top-full z-50 mt-2 min-w-max overflow-hidden rounded-md border border-gray-200 bg-gray-50 py-1 text-sm font-semibold shadow-lg ring-1 ring-slate-900/10 dark:border-gray-700 dark:bg-gray-900 dark:ring-0"
      >
        <div
          role="presentation"
          className="cursor-default border-b border-gray-200 px-4 py-2 dark:border-gray-700"
        >
          <p className="dark:text-slate-500">{name}</p>
          <p className="text-gray-600 dark:text-slate-500">{email}</p>
        </div>
        <Form
          role="presentation"
          preventScrollReset
          replace
          action="/actions/signout"
          method="post"
          onSubmit={() => {
            detailsRef.current?.removeAttribute("open");
          }}
        >
          <button
            role="menuitem"
            className="flex w-full items-center px-4 py-2 transition dark:text-slate-500 hover:text-sky-500  hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <LogOutIcon className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-500" />
            Sign out
          </button>
        </Form>
      </div>
    </details>
  );
}
