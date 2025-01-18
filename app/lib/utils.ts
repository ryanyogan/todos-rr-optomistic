export function formatDate(date: Date | string | number) {
  const timestamp =
    typeof date === "string"
      ? new Date(date)
      : typeof date === "number"
      ? date
      : date.getTime();

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "UTC",
  }).format(timestamp);
}
