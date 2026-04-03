export function formatMemoryRecordTypeLabel(
  recordType: "text" | "media" | "audio" | "voice",
) {
  switch (recordType) {
    case "text":
      return "Story";
    case "media":
      return "Photo or Video";
    case "audio":
      return "Audio";
    case "voice":
      return "Voice Note";
    default:
      return "Memory";
  }
}

export function formatLastEditedLabel(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
