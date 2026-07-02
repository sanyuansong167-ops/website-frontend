import http, { getApiMessage, unwrapApiData } from '../../api/http'
import { getAdminCsrf } from './adminAuth'

export type AdminProduct = {
  id: number
  name: string
  logo?: {
    id?: number
    url?: string
    fileName?: string
  } | null
  subTitle: string
  abstractText: string
  statusTag: string
  detailLink: string
  visible: number
  sortOrder: number
  version: number
}

export type ProductPageResult = {
  list: AdminProduct[]
  total: number
  pageNo: number
  pageSize: number
}

export type ProductPayload = {
  name: string
  logoId: number
  subTitle: string
  abstractText: string
  statusTag: string
  detailLink: string
  visible: number
  sortOrder: number | null
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

export async function getAdminProducts(params: { pageNo?: number; pageSize?: number } = {}) {
  const response = await http.get('/admin/api/products', {
    params: {
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  })
  return unwrapApiData<ProductPageResult>(response.data)
}

export async function createAdminProduct(payload: ProductPayload) {
  return withCsrf<number>(async (headers) => {
    const response = await http.post('/admin/api/products', payload, { headers })
    return unwrapApiData<number>(response.data)
  })
}

export async function updateAdminProduct(id: number, payload: ProductPayload & { version: number }) {
  return withCsrf<void>(async (headers) => {
    const response = await http.put(`/admin/api/products/${id}`, payload, { headers })
    return unwrapApiData<void>(response.data)
  })
}

export async function deleteAdminProduct(id: number, version: number) {
  return withCsrf<void>(async (headers) => {
    const response = await http.delete(`/admin/api/products/${id}`, {
      headers,
      params: { version },
    })
    return unwrapApiData<void>(response.data)
  })
}

export async function sortAdminProducts(sortItems: { id: number; sortOrder: number }[]) {
  return withCsrf<void>(async (headers) => {
    const response = await http.put('/admin/api/products/batch-sort', sortItems, { headers })
    return unwrapApiData<void>(response.data)
  })
}
