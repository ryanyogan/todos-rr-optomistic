import { useRef } from "react";
import { Form, useLocation } from "react-router";
import { MonitorIcon, MoonIcon, SunIcon, UpDownIcon } from "./icons";
import { useTheme } from "./theme-script";

export function ThemeSwitcher() {
  const location = useLocation();
  const theme = useTheme();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={detailsRef} className="group relative cursor-pointer">
      <summary
        role="button"
        aria-haspopup="listbox"
        aria-label="Select your theme preference"
        tabIndex={0}
        className="flex w-28 items-center justify-between border border-gray-200 bg-gray-50 px-4 py-2 transition hover:border-gray-500 group-open:before:fixed group-open:before:inset-0 group-open:before:cursor-auto dark:border-gray-700 dark:bg-gray-900 [&::-webkit-details-marker]:hidden"
      >
        {theme.replace(/^./, (c) => c.toUpperCase())}
        <UpDownIcon className="ml-2 h-4 w-4" />
      </summary>

      <Form
        role="listbox"
        aria-roledescription="Theme switcher"
        preventScrollReset
        replace
        action="/actions/theme"
        method="post"
        onSubmit={() => {
          detailsRef.current?.removeAttribute("open");
        }}
        className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 py-1 text-sm font-semibold shadow-lg ring-1 ring-slate-900/10 dark:border-gray-700 dark:bg-gray-900 dark:ring-0"
      >
        <input
          type="hidden"
          name="returnTo"
          value={location.pathname + location.search + location.hash}
        />
        {[
          { name: "system", icon: MonitorIcon },
          { name: "light", icon: SunIcon },
          { name: "dark", icon: MoonIcon },
        ].map((option) => (
          <button
            key={option.name}
            role="option"
            aria-selected={option.name === theme}
            name="theme"
            value={option.name}
            className={`flex w-full items-center px-4 py-2 transition hover:bg-gray-200 dark:hover:bg-gray-700 ${
              option.name === theme ? "text-sky-500 dark:text-red-500" : ""
            }`}
          >
            <option.icon className="mr-2 h-5 w-5" />{" "}
            {option.name.replace(/^./, (c) => c.toUpperCase())}
          </button>
        ))}
      </Form>
    </details>
  );
}
