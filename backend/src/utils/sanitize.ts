const injectionPatterns = [
  /ignore\s+previous\s+instructions?/gi,
  /ignore\s+all\s+previous/gi,
  /disregard\s+\w+\s+instructions?/gi,
  /you\s+are\s+now/gi,
  /jailbreak/gi,
  /system\s+prompt/gi,
  /forget\s+everything/gi,
  /new\s+personality/gi,
  /act\s+as\s+\w+/gi,
  /do\s+anything\s+now/gi,
  /dan\s+mode/gi,
];

export function sanitizeInput(input: string, maxLength: number): string {
  const sanitized = injectionPatterns.reduce(
    (value, pattern) => value.replace(pattern, ""),
    input
  );

  return sanitized.trim().slice(0, maxLength);
}

export function sanitizeObject(
  obj: Record<string, string>,
  limits: Record<string, number>
): Record<string, string> {
  const sanitized = { ...obj };

  for (const [field, maxLength] of Object.entries(limits)) {
    if (field in obj && typeof obj[field] === "string") {
      sanitized[field] = sanitizeInput(obj[field], maxLength);
    }
  }

  return sanitized;
}
