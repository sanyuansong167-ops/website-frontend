import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

export function getApiMessage(payload: unknown, fallback = '请求失败') {
  if (!payload || typeof payload !== 'object') return fallback

  const source = payload as Record<string, unknown>
  const message = source.message ?? source.msg ?? source.error

  return message === undefined || message === null || message === '' ? fallback : String(message)
}

export function isApiSuccessCode(code: unknown) {
  return code === 0 || code === '0'
}

export function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object') {
    const source = payload as Record<string, unknown>

    if ('code' in source && !isApiSuccessCode(source.code)) {
      const error = new Error(getApiMessage(source))
      ;(error as Error & { code?: unknown; payload?: unknown }).code = source.code
      ;(error as Error & { code?: unknown; payload?: unknown }).payload = source
      throw error
    }

    if ('data' in source) return source.data as T
  }

  return payload as T
}

export default http
