import http, { getApiMessage, unwrapApiData } from '../../api/http'
import { getAdminCsrf } from './adminAuth'

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

function getErrorMessage(error: unknown, fallback = '上传失败') {
  if (error && typeof error === 'object') {
    const source = error as { response?: { data?: unknown }; message?: string }
    return getApiMessage(source.response?.data, source.message || fallback)
  }

  return fallback
}

function isCsrfError(error: unknown) {
  const code = getErrorCode(error)
  return code === 20005 || code === '20005' || code === 403 || code === '403'
}

async function uploadWithFreshCsrf(file: File) {
  const csrf = await getAdminCsrf()
  const formData = new FormData()
  formData.append('file', file)

  const response = await http.post('/admin/api/media/assets', formData, {
    headers: {
      [csrf.headerName]: csrf.token,
    },
  })

  return unwrapApiData<AdminMediaUploadResult>(response.data)
}

export async function uploadAdminMedia(file: File) {
  try {
    return await uploadWithFreshCsrf(file)
  } catch (error) {
    if (isCsrfError(error)) {
      return uploadWithFreshCsrf(file)
    }

    throw new Error(getErrorMessage(error))
  }
}
