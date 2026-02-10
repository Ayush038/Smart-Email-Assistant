const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function apiFetch(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const isAuthRoute =
      endpoint.startsWith("/auth/login") ||
      endpoint.startsWith("/auth/signup");

    if (!isAuthRoute && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return { error: "Unauthorized", status: 401 };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message = "Request failed";

    if (typeof data?.detail === "string") {
      message = data.detail;
    }

    else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((err) => err?.msg || JSON.stringify(err))
        .join(", ");
    }

    else if (typeof data?.detail === "object" && data?.detail !== null) {
      message = data.detail.msg || JSON.stringify(data.detail);
    }

    else if (typeof data === "object") {
      message = JSON.stringify(data);
    }

    return { error: message, status: res.status };
  }

  return data;
}