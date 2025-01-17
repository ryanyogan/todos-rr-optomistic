import { redirect } from "react-router";
import { serializeTheme, validateTheme } from "~/lib/theme-cookie.server";
import type { Route } from "./+types/theme";

export async function action(props: Route.ActionArgs) {
  const formData = await props.request.formData();
  const theme = formData.get("theme");

  if (!validateTheme(theme)) {
    throw new Response("Invalide Theme", { status: 400 });
  }

  let returnTo = formData.get("returnTo");
  if (
    !returnTo ||
    typeof returnTo !== "string" ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//")
  ) {
    returnTo = "/";
  }

  return redirect(returnTo, {
    headers: {
      "Set-Cookie": await serializeTheme(theme),
    },
  });
}
