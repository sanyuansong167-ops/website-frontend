import http, { unwrapApiData } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

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
  return requestAdminWithCsrf<void>('put', '/admin/api/contact-info', payload)
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
  return requestAdminWithCsrf<void>('put', `/admin/api/leads/${id}/status`, payload)
}

export async function exportAdminLeads(payload: LeadExportPayload) {
  return requestAdminWithCsrf<Blob>('post', '/admin/api/leads/export', payload, { responseType: 'blob' })
}
