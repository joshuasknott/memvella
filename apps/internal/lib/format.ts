export function formatDateTime(value: number | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAge(value: number | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const minutes = Math.max(0, Math.floor((Date.now() - value) / 60000));
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return `${hours}h`;
  }

  return `${Math.floor(hours / 24)}d`;
}

export function formatBoundedCount(count: {
  value: number;
  cap: number;
  capped: boolean;
}) {
  return count.capped ? `${count.value}+` : String(count.value);
}

export function boundedCountLabel(count: {
  value: number;
  cap: number;
  capped: boolean;
}) {
  return count.capped ? `Capped at ${count.cap}` : `Bounded to ${count.cap}`;
}

export function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function mixToRows(mix: Record<string, number>) {
  return Object.entries(mix)
    .sort((left, right) => right[1] - left[1])
    .map(([key, value]) => [titleCase(key), value]);
}
