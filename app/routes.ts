import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("actions/theme", "routes/actions/theme.ts"),
  route("actions/signout", "routes/actions/signout.ts"),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
] satisfies RouteConfig;
