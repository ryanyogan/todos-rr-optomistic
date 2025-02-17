import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ThemeScript, useTheme } from "./components/theme-script";
import { parseTheme } from "./lib/theme-cookie.server";

export async function loader(props: Route.LoaderArgs) {
  const theme = await parseTheme(props.request);

  // The Vary: Cookie header informs caching mechanisms that the response
  // may vary based on the Cookie header in the request.
  return data({ theme }, { headers: { Vary: "Cookie" } });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme() === "dark" ? "dark" : "";

  return (
    <html
      lang="en"
      className={`min-h-screen font-system antialiased bg-rose-50 dark:bg-slate-900 ${theme}`}
    >
      <head>
        <ThemeScript />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="max-w-2xl mx-auto p-6 sm:p-12 lg:p-16">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
