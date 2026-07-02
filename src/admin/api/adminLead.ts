import http, { getApiMessage, unwrapApiData } from '../../api/http'
import { getAdminCsrf } from './adminAuth'

export type AdminContactInfo = {
  id?: number
  contactAddress: string
  businessPhone: string
  contactEmail: string
  version: number
  updatedAt?: string
}

export type AdminLead = {
  id: number
  name: string
  company: string
  maskedEmail: string
  maskedPhone: string
  demandDescriptionPreview: string
  status: number
  statusLabel: string
  submittedAt: string
  updatedAt: string
}

export type AdminLeadDetail = {
  id: number
  name: string
  company: string
  email: string
  phone: string
  demandDescription: string
  status: number
  statusLabel: string
  submitIp: string
  submittedAt: string
  updatedAt: string
  version: number
}

export type LeadPageResult = {
  list: AdminLead[]
  total: number
  pageNo: number
  pageSize: number
}

export type LeadQuery = {
  pageNo?: number
  pageSize?: number
  submitAtStart?: string
  submitAtEnd?: string
  status?: number | ''
}

export type LeadExportPayload = {
  exportMode: 'FILTERED' | 'SELECTED'
  submitAtStart?: string
  submitAtEnd?: string
  status?: number | null
  selectedIds?: number[]
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

function cleanQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export async function getAdminContactInfo() {
  const response = await http.get('/admin/api/contact-info')
  return unwrapApiData<AdminContactInfo>(response.data)
}

export async function updateAdminContactInfo(payload: AdminContactInfo) {
  return withCsrf<void>(async (headers) => {
    const response = await http.put('/admin/api/contact-info', payload, { headers })
    return unwrapApiData<void>(response.data)
  })
}

export async function getAdminLeads(query: LeadQuery = {}) {
  const response = await http.get('/admin/api/leads', {
    params: cleanQuery({
      pageNo: query.pageNo ?? 1,
      pageSize: query.pageSize ?? 20,
      submitAtStart: query.submitAtStart,
      submitAtEnd: query.submitAtEnd,
      status: query.status,
    }),
  })
  return unwrapApiData<LeadPageResult>(response.data)
}

export async function getAdminLeadDetail(id: number) {
  const response = await http.get(`/admin/api/leads/${id}`)
  return unwrapApiData<AdminLeadDetail>(response.data)
}

export async function updateAdminLeadStatus(id: number, payload: { version: number; status: number }) {
  return withCsrf<void>(async (headers) => {
    const response = await http.put(`/admin/api/leads/${id}/status`, payload, { headers })
    return unwrapApiData<void>(response.data)
  })
}

export async function exportAdminLeads(payload: LeadExportPayload) {
  return withCsrf<Blob>(async (headers) => {
    const response = await http.post('/admin/api/leads/export', payload, {
      headers,
      responseType: 'blob',
    })
    return response.data
  })
}
