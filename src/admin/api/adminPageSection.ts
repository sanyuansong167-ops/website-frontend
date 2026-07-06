import http, { getApiErrorMessage, unwrapApiData } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

export type PageSectionStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE'

export type AdminPageSection = {
  id: number
  pageCode: string
  sectionCode: string
  title: string
  subtitle?: string | null
  description?: string | null
  contentJson?: string | null
  sortOrder: number
  visible: boolean
  status: PageSectionStatus | string
  version: number
  createdAt?: string
  updatedAt?: string
}

export type PageSectionPayload = {
  version?: number
  pageCode: string
  sectionCode: string
  title: string
  subtitle?: string | null
  description?: string | null
  contentJson?: string | null
  sortOrder?: number | null
  visible: boolean
  status: PageSectionStatus
}

export type PageSectionPage = {
  list: AdminPageSection[]
  total: number
  pageNo: number
  pageSize: number
}

export async function listAdminPageSections(params: { pageCode?: string; pageNo?: number; pageSize?: number } = {}) {
  try {
    const response = await http.get('/admin/api/site/page-sections', { params })
    return unwrapApiData<PageSectionPage>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '获取页面区块失败'))
  }
}

export async function getAdminPageSection(id: number) {
  try {
    const response = await http.get(`/admin/api/site/page-sections/${encodeURIComponent(String(id))}`)
    return unwrapApiData<AdminPageSection>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '获取页面区块详情失败'))
  }
}

export async function createAdminPageSection(payload: PageSectionPayload) {
  try {
    return await requestAdminWithCsrf<number>('post', '/admin/api/site/page-sections', payload)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '新增页面区块失败'))
  }
}

export async function updateAdminPageSection(id: number, payload: PageSectionPayload) {
  try {
    return await requestAdminWithCsrf<AdminPageSection>(
      'put',
      `/admin/api/site/page-sections/${encodeURIComponent(String(id))}`,
      payload,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '保存页面区块失败'))
  }
}

export async function deleteAdminPageSection(id: number, version: number) {
  try {
    await requestAdminWithCsrf<void>(
      'delete',
      `/admin/api/site/page-sections/${encodeURIComponent(String(id))}?version=${encodeURIComponent(String(version))}`,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '删除页面区块失败'))
  }
}

export async function updateAdminPageSectionVisibility(id: number, visible: boolean, version: number) {
  try {
    return await requestAdminWithCsrf<AdminPageSection>(
      'put',
      `/admin/api/site/page-sections/${encodeURIComponent(String(id))}/visibility`,
      { visible, version },
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '更新显示状态失败'))
  }
}

export async function batchSortAdminPageSections(items: Array<{ id: number; sortOrder: number }>) {
  try {
    await requestAdminWithCsrf<void>('put', '/admin/api/site/page-sections/batch-sort', items)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '保存排序失败'))
  }
}
