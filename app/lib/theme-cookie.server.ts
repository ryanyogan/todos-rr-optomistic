import { createCookie } from "react-router";
import type { Theme } from "~/types";

const cookie = createCookie("theme", {
  maxAge: 31_536_000,
});

export function validateTheme(value: unknown): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

export async function parseTheme(request: Request) {
  const header = request.headers.get("Cookie");
  const cookieValues = await cookie.parse(header);
  const theme = cookieValues?.theme;

  if (validateTheme(theme)) {
    return theme;
  }

  return "system";
}

export function serializeTheme(theme: Theme) {
  // If the theme is "system", we want to delete the cookie
  const eatCookie = theme === "system"; // Cookie Monster doesn't like system theme

  if (eatCookie) {
    return cookie.serialize({}, { expires: new Date(0), maxAge: 0 });
  } else {
    return cookie.serialize({ theme });
  }
}
