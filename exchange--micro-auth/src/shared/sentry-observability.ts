const SENSITIVE_KEY_PATTERN =
  /(secret|token|authorization|cookie|password|passphrase|private|api[-_]?key|signature|seed|mnemonic|payload|raw|headers|body|credential|jwt|bearer|session)/i;

const SENSITIVE_VALUE_PATTERNS = [
  /\bmongodb(?:\+srv)?:\/\/[^\s]+/gi,
  /\bredis(?:s)?:\/\/[^\s]+/gi,
  /\bbearer\s+[a-z0-9._-]{12,}/gi,
  /\beyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
  /\b(token|secret|api[_-]?key|authorization|password)=([^&\s]+)/gi,
];

export function redactSensitiveText(value: unknown, maxLength = 500) {
  const text = String(value ?? "");
  return SENSITIVE_VALUE_PATTERNS.reduce(
    (current, pattern) =>
      current.replace(pattern, (_match, key) =>
        typeof key === "string" && key ? `${key}=[redacted]` : "[redacted]",
      ),
    text,
  ).slice(0, maxLength);
}

export function sanitizeObservabilityValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return redactSensitiveText(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "boolean") return value;
  if (depth >= 4) return "[truncated]";

  if (Array.isArray(value)) {
    return value
      .slice(0, 40)
      .map((entry) => sanitizeObservabilityValue(entry, depth + 1))
      .filter((entry) => entry !== undefined);
  }

  if (typeof value !== "object") return undefined;

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value).slice(0, 80)) {
    const safeKey = key.replace(/[\u0000-\u001f\u007f.]/g, "").slice(0, 80);
    if (!safeKey || SENSITIVE_KEY_PATTERN.test(safeKey)) continue;
    const safeValue = sanitizeObservabilityValue(entry, depth + 1);
    if (safeValue !== undefined) output[safeKey] = safeValue;
  }
  return output;
}
