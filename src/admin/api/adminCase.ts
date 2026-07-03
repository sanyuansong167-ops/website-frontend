import http, { unwrapApiData } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

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
  return requestAdminWithCsrf<AdminCase[]>('post', '/admin/api/cases', payload)
}

export async function updateAdminCase(id: number, payload: CasePayload & { version: number }) {
  return requestAdminWithCsrf<AdminCase[]>('put', `/admin/api/cases/${id}`, payload)
}

export async function deleteAdminCase(id: number, version: number) {
  return requestAdminWithCsrf<AdminCase[]>('delete', `/admin/api/cases/${id}`, { version })
}

export async function reorderAdminCases(orderedIds: number[]) {
  return requestAdminWithCsrf<AdminCase[]>('post', '/admin/api/cases/reorder', { orderedIds })
}
