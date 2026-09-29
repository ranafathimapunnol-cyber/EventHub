export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthData = {
  access_token: string;
  token_type: string;
  user: User;
};

export function saveAuth(data: AuthData) {
  if (typeof window === "undefined") return;

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("token_type", data.token_type || "Bearer");
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("access_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function getAuth() {
  return {
    token: getToken(),
    user: getUser(),
  };
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user");
}
