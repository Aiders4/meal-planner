const TOKEN_KEY = 'meal-planner-token'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface ApiOptions extends RequestInit {
  suppressAuthRedirect?: boolean
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { suppressAuthRedirect, ...fetchOptions } = options

  const headers = new Headers(fetchOptions.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(endpoint, { ...fetchOptions, headers })

  if (res.status === 401) {
    clearStoredToken()
    if (!suppressAuthRedirect) {
      window.location.href = '/login'
    }
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiError(res.status, body.error || 'Request failed')
  }

  return res.json() as Promise<T>
}
