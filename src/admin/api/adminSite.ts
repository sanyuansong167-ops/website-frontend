import http, { getApiMessage, unwrapApiData } from '../../api/http'
import { getAdminCsrf } from './adminAuth'

export type AdminSiteConfig = {
  id?: number
  version: number
  siteTitle: string
  seoKeywords: string
  seoDescription: string
  brandSlogan: string
  brandTagline: string
  logoLightMediaId: number | null
  logoLightUrl: string | null
  logoDarkMediaId: number | null
  logoDarkUrl: string | null
  updatedAt?: string
}

export type HomeBannerButton = {
  enabled: boolean
  text: string
  targetType: string
  routePath: string
  anchorCode: string
  externalUrl: string
  openInNewTab: boolean
}

export type AdminHomeBanner = {
  id?: number
  version: number
  mainTitle: string
  subTitle: string
  backgroundImageMediaId: number | null
  backgroundImageUrl: string | null
  primaryButton: HomeBannerButton
  secondaryButton: HomeBannerButton
  updatedAt?: string
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

async function putWithCsrf<T>(url: string, payload: unknown, retry = true): Promise<T> {
  try {
    const csrf = await getAdminCsrf()
    const response = await http.put(url, payload, {
      headers: {
        [csrf.headerName]: csrf.token,
      },
    })
    return unwrapApiData<T>(response.data)
  } catch (error) {
    if (retry && isCsrfError(error)) {
      return putWithCsrf<T>(url, payload, false)
    }

    throw new Error(getErrorMessage(error))
  }
}

export async function getAdminSiteConfig() {
  const response = await http.get('/admin/api/site/config')
  return unwrapApiData<AdminSiteConfig>(response.data)
}

export async function updateAdminSiteConfig(payload: {
  version: number
  siteTitle: string
  seoKeywords: string
  seoDescription: string
  brandSlogan: string
  brandTagline: string
  logoLightMediaId: number | null
  logoDarkMediaId: number | null
}) {
  return putWithCsrf<AdminSiteConfig>('/admin/api/site/config', payload)
}

export async function getAdminHomeBanner() {
  const response = await http.get('/admin/api/site/home-banner')
  return unwrapApiData<AdminHomeBanner>(response.data)
}

export async function updateAdminHomeBanner(payload: {
  version: number
  mainTitle: string
  subTitle: string
  backgroundImageMediaId: number | null
  primaryButton: HomeBannerButton
  secondaryButton: HomeBannerButton
}) {
  return putWithCsrf<AdminHomeBanner>('/admin/api/site/home-banner', payload)
}
