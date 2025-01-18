import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("actions/theme", "routes/actions/theme.ts"),
  route("signup", "routes/signup.tsx"),
] satisfies RouteConfig;
