import http, { getApiMessage, unwrapApiData } from '../../api/http'
import { getAdminCsrf } from './adminAuth'

export type AdminCase = {
  id: number
  title: string
  logoMediaId: number
  logoUrl: string
  summary: string
  keywords: string[]
  visible: boolean
  sortOrder: number
  version: number
  updatedAt?: string
}

export type CasePageResult = {
  list: AdminCase[]
  total: number
  pageNo: number
  pageSize: number
}

export type CasePayload = {
  title: string
  logoMediaId: number
  summary: string
  keywords: string[]
  visible: boolean
  version?: number
}

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

async function withCsrf<T>(request: (headers: Record<string, string>) => Promise<T>, retry = true): Promise<T> {
  try {
    const csrf = await getAdminCsrf()
    return await request({ [csrf.headerName]: csrf.token })
  } catch (error) {
    if (retry && isCsrfError(error)) {
      return withCsrf<T>(request, false)
    }

    throw new Error(getErrorMessage(error))
  }
}

export async function getAdminCases(params: { pageNo?: number; pageSize?: number } = {}) {
  const response = await http.get('/admin/api/cases', {
    params: {
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  })
  return unwrapApiData<CasePageResult>(response.data)
}

export async function createAdminCase(payload: CasePayload) {
  return withCsrf<AdminCase[]>(async (headers) => {
    const response = await http.post('/admin/api/cases', payload, { headers })
    return unwrapApiData<AdminCase[]>(response.data)
  })
}

export async function updateAdminCase(id: number, payload: CasePayload & { version: number }) {
  return withCsrf<AdminCase[]>(async (headers) => {
    const response = await http.put(`/admin/api/cases/${id}`, payload, { headers })
    return unwrapApiData<AdminCase[]>(response.data)
  })
}

export async function deleteAdminCase(id: number, version: number) {
  return withCsrf<AdminCase[]>(async (headers) => {
    const response = await http.delete(`/admin/api/cases/${id}`, {
      data: { version },
      headers,
    })
    return unwrapApiData<AdminCase[]>(response.data)
  })
}

export async function reorderAdminCases(orderedIds: number[]) {
  return withCsrf<AdminCase[]>(async (headers) => {
    const response = await http.post('/admin/api/cases/reorder', { orderedIds }, { headers })
    return unwrapApiData<AdminCase[]>(response.data)
  })
}
