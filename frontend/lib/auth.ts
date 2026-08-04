export type AuthUser = {
  userId: string;
  email: string;
  role: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("codexa_token");
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("codexa_token", token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("codexa_token");
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded) as AuthUser;
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  const token = getToken();
  return token ? decodeToken(token) : null;
}
