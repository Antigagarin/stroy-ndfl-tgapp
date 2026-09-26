const API_BASE = import.meta.env.VITE_API_URL ?? ""

function getInitData(): string {
  if (typeof window === "undefined") return ""
  return (
    window.Telegram?.WebApp?.initData ||
    new URLSearchParams(window.location.search).get("initData") ||
    ""
  )
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function apiPost<T>(path: string, body: object): Promise<T> {
  return request<T>(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, initData: getInitData() }),
  })
}

export function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(API_BASE + path, window.location.origin)
  url.searchParams.set("initData", getInitData())
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return request<T>(url.toString())
}

export function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  formData.append("initData", getInitData())
  return request<T>(API_BASE + path, { method: "POST", body: formData })
}
