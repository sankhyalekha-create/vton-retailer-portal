const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

// Auth
export const login = (email: string, password: string) =>
  request<{ access_token: string; role: string; tenant_id: string }>('/retailer/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const getMe = (token: string) => request<{ id: string; email: string; full_name: string; role: string; tenant_id: string }>('/retailer/auth/me', {}, token)

// Products
export const listProducts = (token: string) => request<object[]>('/retailer/products/', {}, token)
export const uploadProduct = (token: string, form: FormData) =>
  request('/retailer/products/', { method: 'POST', body: form }, token)
export const updateProduct = (token: string, id: string, form: FormData) =>
  request(`/retailer/products/${id}`, { method: 'PATCH', body: form }, token)
export const deleteProduct = (token: string, id: string) =>
  request(`/retailer/products/${id}`, { method: 'DELETE' }, token)

// Sessions
export const createSession = (token: string, max_trials?: number) =>
  request('/retailer/sessions/', { method: 'POST', body: JSON.stringify({ max_trials }) }, token)
export const listSessions = (token: string) => request<object[]>('/retailer/sessions/', {}, token)
export const topupSession = (token: string, sessionId: string, extra_trials: number) =>
  request(`/retailer/sessions/${sessionId}/topup`, { method: 'POST', body: JSON.stringify({ extra_trials }) }, token)
export const revokeSession = (token: string, sessionId: string) =>
  request(`/retailer/sessions/${sessionId}/revoke`, { method: 'PATCH' }, token)

// Analytics
export const getAnalytics = (token: string) => request('/retailer/analytics/summary', {}, token)

// Config
export const getConfig = (token: string) => request('/retailer/config/', {}, token)
export const updateConfig = (token: string, config: object) =>
  request('/retailer/config/', { method: 'PATCH', body: JSON.stringify(config) }, token)
