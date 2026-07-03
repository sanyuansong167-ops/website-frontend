import axios from 'axios'

const ADMIN_LOGIN_PATH = '/admin/login'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  xsrfCookieName: null,
})

export type ApiError = Error & { code?: unknown; payload?: unknown; status?: number }

export function clearAdminSessionState() {
  try {
    localStorage.removeItem('adminUser')
    sessionStorage.removeItem('adminUser')
  } catch {
    // Storage can be unavailable in private browsing or test environments.
  }
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.location !== 'undefined'
}

function isAdminApiUrl(url?: string) {
  return typeof url === 'string' && url.startsWith('/admin/api')
}

function redirectToAdminLogin() {
  if (!isBrowser()) return

  const { pathname, search, hash } = window.location
  if (pathname === ADMIN_LOGIN_PATH) return

  const redirect = `${pathname}${search}${hash}`
  const query = redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''
  window.location.assign(`${ADMIN_LOGIN_PATH}${query}`)
}

export function getApiMessage(payload: unknown, fallback = '请求失败') {
  if (!payload || typeof payload !== 'object') return fallback

  const source = payload as Record<string, unknown>
  const message = source.message ?? source.msg ?? source.error

  return message === undefined || message === null || message === '' ? fallback : String(message)
}

export function isApiSuccessCode(code: unknown) {
  return code === 0 || code === 200 || code === '0' || code === '200' || code === 'success'
}

export function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const source = payload as Record<string, unknown>

    if ('code' in source && !isApiSuccessCode(source.code)) {
      const error = new Error(getApiMessage(source)) as ApiError
      error.code = source.code
      error.payload = source
      throw error
    }

    if ('data' in source) return source.data as T
  }

  return payload as T
}

export function getApiErrorCode(error: unknown) {
  if (error && typeof error === 'object') {
    const source = error as { response?: { status?: number; data?: unknown }; code?: unknown; status?: number }
    const data = source.response?.data

    if (data && typeof data === 'object' && 'code' in data) {
      return (data as { code?: unknown }).code
    }

    return source.response?.status ?? source.status ?? source.code
  }

  return undefined
}

export function getApiErrorMessage(error: unknown, fallback = '请求失败') {
  if (error && typeof error === 'object') {
    const source = error as { response?: { data?: unknown }; message?: string }
    return getApiMessage(source.response?.data, source.message || fallback)
  }

  return fallback
}

export function isCsrfError(error: unknown) {
  const code = getApiErrorCode(error)
  return code === 20005 || code === '20005' || code === 403 || code === '403'
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if ((status === 401 || (status === 403 && !isCsrfError(error))) && isAdminApiUrl(error?.config?.url)) {
      clearAdminSessionState()
      redirectToAdminLogin()
    }

    return Promise.reject(error)
  },
)

export default http
