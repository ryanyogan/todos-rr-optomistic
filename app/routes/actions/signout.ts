import { redirect } from "react-router";
import { destroySession, getSession } from "~/lib/session.server";
import type { Route } from "./+types/signout";

export async function action(props: Route.ActionArgs) {
  const session = await getSession(props.request.headers.get("Cookie"));

  return redirect("/signin", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
