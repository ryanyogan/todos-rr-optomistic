import { format, parseISO } from "date-fns";

export function formatDate(dateString: string) {
  if (typeof dateString !== "string") {
    return "";
  }

  const truncateDate = dateString.split(".")[0] ?? dateString;
  const date = parseISO(truncateDate);
  return format(date, "MMMM d, yyyy, h:mm a");
}
