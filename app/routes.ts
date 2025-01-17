import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("actions/theme", "routes/actions/theme.ts"),
] satisfies RouteConfig;
