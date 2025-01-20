import { useRef } from "react";
import { Form, useSearchParams } from "react-router";
import { UpDownIcon } from "./icons";

export function StateSelector() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "all";

  return (
    <details ref={detailsRef} className="group relative cursor-pointer">
      <summary
        role="button"
        aria-haspopup="listbox"
        aria-label="Filter your tasks by state"
        tabIndex={0}
        className="flex w-32 rounded-md dark:text-zinc-300 text-sm items-center justify-between border border-gray-200 bg-gray-50 px-4 py-2 transition hover:border-gray-500 group-open:before:fixed group-open:before:inset-0 group-open:before:cursor-auto dark:border-gray-700 dark:bg-slate-800 [&::-webkit-details-marker]:hidden"
      >
        {view.replace(/^./, (c) => c.toUpperCase())}
        <UpDownIcon className="ml-2 h-4 w-4" />
      </summary>

      <Form
        role="listbox"
        aria-roledescription="Task State Selector"
        preventScrollReset
        replace
        onSubmit={() => {
          detailsRef.current?.removeAttribute("open");
        }}
        className="absolute left-0 top-full z-50 mt-2 w-36 overflow-hidden dark:text-slate-400 rounded-md border border-gray-200 bg-gray-50 py-1 text-sm font-semibold shadow-lg ring-1 ring-slate-900/10 dark:border-gray-700 dark:bg-gray-800 dark:ring-0"
      >
        {[{ name: "all" }, { name: "active" }, { name: "completed" }].map(
          (option) => (
            <button
              key={option.name}
              role="option"
              aria-selected={option.name === view}
              name="view"
              value={option.name}
              className={`flex w-full items-center px-4 py-2 transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
                option.name === view ? "text-sky-500 dark:text-sky-300" : ""
              }`}
            >
              {option.name.replace(/^./, (c) => c.toUpperCase())}
            </button>
          )
        )}
      </Form>
    </details>
  );
}
