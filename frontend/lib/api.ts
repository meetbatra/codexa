import { getToken } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const token = getToken();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL ?? ""}${path}`, {
    ...options,
    headers,
  });
  const data = (await response.json().catch(() => null)) as {
    error?: unknown;
    message?: unknown;
  } | null;

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : "Request failed";
    throw new Error(message);
  }

  return data;
}
