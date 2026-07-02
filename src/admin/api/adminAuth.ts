import http, { getApiMessage, unwrapApiData } from '../../api/http'

export type AdminCurrentUser = {
  userId: number
  username: string
  displayName: string
  roleCode: string
}

type CsrfToken = {
  token: string
  headerName: string
  parameterName: string
}

let csrfToken: CsrfToken | null = null

function getErrorCode(error: unknown) {
  if (error && typeof error === 'object') {
    const source = error as { response?: { status?: number; data?: unknown }; code?: unknown }
    const data = source.response?.data

    if (data && typeof data === 'object' && 'code' in data) {
      return (data as { code?: unknown }).code
    }

    return source.response?.status ?? source.code
  }

  return undefined
}

function getErrorMessage(error: unknown, fallback = '请求失败') {
  if (error && typeof error === 'object') {
    const source = error as { response?: { data?: unknown }; message?: string }
    return getApiMessage(source.response?.data, source.message || fallback)
  }

  return fallback
}

function isCsrfError(error: unknown) {
  const code = getErrorCode(error)
  return code === 20005 || code === '20005'
}

export class AdminApiError extends Error {
  code?: unknown

  constructor(message: string, code?: unknown) {
    super(message)
    this.name = 'AdminApiError'
    this.code = code
  }
}

export async function getAdminCsrf() {
  const response = await http.get('/admin/api/auth/csrf')
  csrfToken = unwrapApiData<CsrfToken>(response.data)
  return csrfToken
}

async function ensureCsrfToken() {
  if (csrfToken?.token && csrfToken.headerName) return csrfToken
  return getAdminCsrf()
}

function csrfHeaders(token: CsrfToken) {
  return {
    [token.headerName]: token.token,
  }
}

async function postWithCsrf<T>(url: string, payload?: unknown, retry = true): Promise<T> {
  try {
    const token = await ensureCsrfToken()
    const response = await http.post(url, payload, { headers: csrfHeaders(token) })
    return unwrapApiData<T>(response.data)
  } catch (error) {
    if (retry && isCsrfError(error)) {
      csrfToken = null
      return postWithCsrf<T>(url, payload, false)
    }

    throw new AdminApiError(getErrorMessage(error), getErrorCode(error))
  }
}

export async function adminLogin(payload: { username: string; password: string }) {
  return postWithCsrf<AdminCurrentUser>('/admin/api/auth/login', payload)
}

export async function adminLogout() {
  return postWithCsrf<void>('/admin/api/auth/logout')
}

export async function getAdminMe() {
  try {
    const response = await http.get('/admin/api/auth/me')
    return unwrapApiData<AdminCurrentUser>(response.data)
  } catch (error) {
    throw new AdminApiError(getErrorMessage(error, '请先登录'), getErrorCode(error))
  }
}

export function clearAdminCsrf() {
  csrfToken = null
}
