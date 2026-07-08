import http, { unwrapApiData } from '../../api/http'

export type AdminDashboardContentStats = {
  productCount: number
  caseCount: number
  aiAbilityCount: number
  mediaCount: number
  pageCount: number
}

export type AdminDashboardLeadStats = {
  totalCount: number
  currentMonthNewCount: number
  pendingCount: number
  handledCount: number
}

export type AdminDashboardMediaStats = {
  imageCount: number
  videoCount: number
  documentCount: number
}

export type AdminDashboardBusinessModuleStats = {
  businessCode: string
  businessName: string
  businessStatus: string
  pageCount: number
  pageBlockCount: number
  contentCount: number
}

export type AdminDashboardBusinessStats = {
  modules: AdminDashboardBusinessModuleStats[]
}

export type AdminDashboardRiskAlerts = {
  unpublishedContentCount: number
  invalidContentCount: number
  referencedContentCount: number
  pendingLeadCount: number
}

export async function getAdminDashboardContentStats() {
  const response = await http.get('/admin/api/dashboard/content-stats')
  return unwrapApiData<AdminDashboardContentStats>(response.data)
}

export async function getAdminDashboardLeadStats() {
  const response = await http.get('/admin/api/dashboard/lead-stats')
  return unwrapApiData<AdminDashboardLeadStats>(response.data)
}

export async function getAdminDashboardMediaStats() {
  const response = await http.get('/admin/api/dashboard/media-stats')
  return unwrapApiData<AdminDashboardMediaStats>(response.data)
}

export async function getAdminDashboardBusinessStats() {
  const response = await http.get('/admin/api/dashboard/business-stats')
  return unwrapApiData<AdminDashboardBusinessStats>(response.data)
}

export async function getAdminDashboardRiskAlerts() {
  const response = await http.get('/admin/api/dashboard/risk-alerts')
  return unwrapApiData<AdminDashboardRiskAlerts>(response.data)
}
