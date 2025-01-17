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
import { useTheme } from "./components/theme-script";
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
      className={`bg-white/90 font-system antialiased dark:bg-gray-900 ${theme}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen max-w-[100vw] flex-col overflow-x-hidden bg-zinc-50  px-4 py-8">
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
