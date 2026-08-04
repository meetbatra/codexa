import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const injectionPatterns = [
  /ignore\s+(?:all\s+)?previous\s+instructions?/gi,
  /disregard\s+(?:all\s+|the\s+)?(?:previous\s+)?instructions?/gi,
  /system\s+prompt/gi,
  /you\s+are\s+now/gi,
  /jailbreak/gi,
];

function sanitizeCode(code: string) {
  const sanitized = injectionPatterns.reduce(
    (value, pattern) => value.replace(pattern, ""),
    code
  );

  return sanitized.slice(0, 3000);
}

export async function generateCodeFeedback(
  code: string,
  language: string,
  status: string
): Promise<string> {
  try {
    const sanitizedCode = sanitizeCode(code);
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a code quality reviewer for a programming learning platform. Analyze the submitted code and provide concise, constructive feedback on code quality, readability, efficiency, and best practices. Do not execute the code. Keep feedback under 150 words.",
      prompt: `Language: ${language}\nStatus: ${status}\n\nCode:\n<submitted_code>\n${sanitizedCode}\n</submitted_code>\n\nProvide quality feedback.`,
    });

    return text;
  } catch (_error) {
    return "Feedback unavailable.";
  }
}
