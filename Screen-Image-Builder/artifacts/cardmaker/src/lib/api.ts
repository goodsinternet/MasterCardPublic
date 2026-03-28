const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("cm_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data as T;
}

export interface UserProfile {
  id: number;
  email: string;
  referralCode: string;
  bonusGenerations: number;
  isAdmin?: boolean;
}

export interface GenerationItem {
  id: number;
  outputText: string | null;
  outputImageUrl: string | null;
  marketplace: string | null;
  price: string | null;
  productName: string | null;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface GenerateResult {
  id: number;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  productName: string;
  characteristics: string;
  keywords: string;
  category: string;
  seoTips: string;
  marketplace: string;
}

export const api = {
  auth: {
    register: (email: string, password: string, referralCode?: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, referralCode }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  },
  user: {
    get: () =>
      request<{ user: UserProfile; generations: GenerationItem[]; referralCount: number }>("/user"),
  },
  generate: {
    create: (body: {
      imagesBase64?: string[];
      imageBase64?: string;
      price?: string;
      marketplace: string;
      productName?: string;
      description?: string;
      imageCount?: number;
    }) =>
      request<GenerateResult>("/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    list: () =>
      request<{ generations: GenerationItem[] }>("/generations"),
  },
  referral: {
    apply: (code: string) =>
      request<{ success: boolean; message: string }>("/referral/apply", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  },
  admin: {
    stats: () =>
      request<{ totalUsers: number; totalGenerations: number; doneGenerations: number }>("/admin/stats"),
    users: () =>
      request<{ users: Array<{ id: number; email: string; isAdmin: boolean; bonusGenerations: number; referralCode: string; createdAt: string; generationCount: number }> }>("/admin/users"),
    generations: () =>
      request<{ generations: Array<{ id: number; userId: number; marketplace: string | null; productName: string | null; price: string | null; status: string; createdAt: string }> }>("/admin/generations"),
    updateGenerations: (userId: number, bonusGenerations: number) =>
      request<{ user: { id: number; email: string; bonusGenerations: number } }>(`/admin/users/${userId}/generations`, {
        method: "PATCH",
        body: JSON.stringify({ bonusGenerations }),
      }),
  },
};

export function saveAuth(token: string) {
  localStorage.setItem("cm_token", token);
}

export function clearAuth() {
  localStorage.removeItem("cm_token");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("cm_token");
}
