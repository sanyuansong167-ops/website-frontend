import http, { getApiErrorMessage, unwrapApiData } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

export type AdminMediaAsset = {
  id: number
  mediaType: 'IMAGE' | 'DOCUMENT' | string
  status: 'ACTIVE' | 'DELETED' | string
  originalFilename: string
  contentType: string
  storagePath: string
  publicUrl: string
  absoluteUrl?: string | null
  fileSize: number
  usageTag: string
  altText?: string | null
  remark?: string | null
  version: number
  createdAt?: string
  updatedAt?: string
}

export type AdminMediaUploadResult = {
  mediaId: number
  mediaType: string
  originalFilename: string
  contentType: string
  size: number
  path: string
  url: string
  absoluteUrl: string
}

export type AdminMediaListParams = {
  keyword?: string
  mediaType?: string
  usageTag?: string
  status?: string
  page?: number
  size?: number
}

export type AdminMediaPageResult = {
  list: AdminMediaAsset[]
  total: number
  pageNo: number
  pageSize: number
}

export type AdminMediaUpdatePayload = {
  usageTag: string
  altText?: string | null
  remark?: string | null
  version: number
}

export async function listAdminMedia(params: AdminMediaListParams = {}) {
  try {
    const response = await http.get('/admin/api/media/assets', { params })
    return unwrapApiData<AdminMediaPageResult>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '获取媒体列表失败'))
  }
}

export async function getAdminMedia(id: number) {
  try {
    const response = await http.get(`/admin/api/media/assets/${encodeURIComponent(String(id))}`)
    return unwrapApiData<AdminMediaAsset>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '获取媒体详情失败'))
  }
}

export async function uploadAdminMedia(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    return await requestAdminWithCsrf<AdminMediaUploadResult>('post', '/admin/api/media/assets', formData)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '上传失败'))
  }
}

export async function updateAdminMedia(id: number, payload: AdminMediaUpdatePayload) {
  try {
    return await requestAdminWithCsrf<AdminMediaAsset>(
      'put',
      `/admin/api/media/assets/${encodeURIComponent(String(id))}`,
      payload,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '保存媒体信息失败'))
  }
}

export async function deleteAdminMedia(id: number, version: number) {
  try {
    await requestAdminWithCsrf<void>(
      'delete',
      `/admin/api/media/assets/${encodeURIComponent(String(id))}?version=${encodeURIComponent(String(version))}`,
    )
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '删除媒体失败'))
  }
}
