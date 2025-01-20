import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { Form, useLocation } from "react-router";
import { useTheme } from "./theme-script";

export function ThemeSwitcher() {
  const location = useLocation();
  const theme = useTheme();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <span ref={detailsRef} className="group relative cursor-pointer">
      <Form
        aria-roledescription="Theme switcher"
        preventScrollReset
        replace
        action="/actions/theme"
        method="post"
        onSubmit={() => {
          detailsRef.current?.removeAttribute("open");
        }}
      >
        <input
          type="hidden"
          name="returnTo"
          value={location.pathname + location.search + location.hash}
        />
        <button
          name="theme"
          value={theme === "system" || theme === "light" ? "dark" : "light"}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === "system" || theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-white" />
          )}
        </button>
      </Form>
    </span>
  );
}
