import http, {
  getApiErrorCode,
  getApiErrorMessage,
  isCsrfError,
  unwrapApiData,
} from '../../api/http'

export type AdminCurrentUser = {
  userId: number
  username: string
  displayName: string
  roleCode: string
}

export type CsrfToken = {
  token: string
  headerName: string
  parameterName: string
}

export type AdminHttpMethod = 'post' | 'put' | 'patch' | 'delete'

let csrfToken: CsrfToken | null = null

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

export async function ensureAdminCsrf() {
  if (csrfToken?.token && csrfToken.headerName) return csrfToken
  return getAdminCsrf()
}

export function getAdminCsrfHeaders(token: CsrfToken) {
  return {
    [token.headerName]: token.token,
  }
}

export async function requestAdminWithCsrf<T>(
  method: AdminHttpMethod,
  url: string,
  payload?: unknown,
  config: Record<string, unknown> = {},
  retry = true,
): Promise<T> {
  try {
    const token = await ensureAdminCsrf()
    const headers = {
      ...((config.headers as Record<string, string> | undefined) || {}),
      ...getAdminCsrfHeaders(token),
    }
    const requestConfig = { ...config, headers }
    const response =
      method === 'delete'
        ? await http.delete(url, { ...requestConfig, data: payload })
        : await http[method](url, payload, requestConfig)

    return unwrapApiData<T>(response.data)
  } catch (error) {
    if (retry && isCsrfError(error)) {
      csrfToken = null
      return requestAdminWithCsrf<T>(method, url, payload, config, false)
    }

    throw new AdminApiError(getApiErrorMessage(error), getApiErrorCode(error))
  }
}

export async function adminLogin(payload: { username: string; password: string }) {
  try {
    const response = await http.post('/admin/api/auth/login', payload)
    return unwrapApiData<AdminCurrentUser>(response.data)
  } catch (error) {
    throw new AdminApiError(getApiErrorMessage(error), getApiErrorCode(error))
  }
}

export async function adminLogout() {
  return requestAdminWithCsrf<void>('post', '/admin/api/auth/logout')
}

export async function getAdminMe() {
  try {
    const response = await http.get('/admin/api/auth/me')
    return unwrapApiData<AdminCurrentUser>(response.data)
  } catch (error) {
    throw new AdminApiError(getApiErrorMessage(error, '请先登录'), getApiErrorCode(error))
  }
}

export function clearAdminCsrf() {
  csrfToken = null
}
