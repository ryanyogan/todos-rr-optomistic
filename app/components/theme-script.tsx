import { useNavigation, useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "~/root";
import type { Theme } from "~/types";

export function useTheme(): Theme {
  const rootLoaderData = useRouteLoaderData<typeof rootLoader>("root");
  const rootTheme = rootLoaderData?.theme ?? "system";
  const navigation = useNavigation();

  const theme = navigation.formData?.has("theme")
    ? (navigation.formData.get("theme") as Theme)
    : rootTheme;

  return theme;
}
