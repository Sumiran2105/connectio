const TIME_ZONE_OFFSET_PATTERN = /([zZ]|[+-]\d{2}:?\d{2})$/;
const ISO_LIKE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?)?$/;

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

const messageDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function parsePlatformDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue =
    ISO_LIKE_PATTERN.test(rawValue) && !TIME_ZONE_OFFSET_PATTERN.test(rawValue)
      ? `${rawValue.replace(" ", "T")}Z`
      : rawValue;

  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getPlatformTimestamp(value) {
  const date = parsePlatformDate(value);
  return date ? date.getTime() : 0;
}

export function formatPlatformTime(value = Date.now()) {
  const date = parsePlatformDate(value);
  return date ? timeFormatter.format(date) : String(value);
}

export function formatPlatformDateTime(value = Date.now()) {
  const date = parsePlatformDate(value);
  return date ? messageDateTimeFormatter.format(date) : String(value);
}
