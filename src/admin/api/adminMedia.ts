import { getApiErrorMessage } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

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

export async function uploadAdminMedia(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    return await requestAdminWithCsrf<AdminMediaUploadResult>('post', '/admin/api/media/assets', formData)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '上传失败'))
  }
}
