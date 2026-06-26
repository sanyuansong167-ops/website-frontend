import http from './http'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isHtmlPayload(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized.startsWith('<!doctype html') || normalized.startsWith('<html')
}

function isSuccessCode(value: unknown) {
  return value === 0 || value === 200 || value === '0' || value === '200' || value === 'success'
}

function getMessage(payload: Record<string, unknown>) {
  const message = payload.message || payload.msg || payload.error
  return message === undefined || message === null ? '' : String(message)
}

function normalizePortalPayload(payload: unknown, url: string): unknown {
  if (typeof payload === 'string') {
    if (isHtmlPayload(payload)) {
      throw new Error(`[Portal API] ${url} returned HTML instead of JSON. Check Vite proxy or backend route.`)
    }

    const trimmed = payload.trim()
    if (!trimmed) return payload

    try {
      return JSON.parse(trimmed)
    } catch {
      throw new Error(`[Portal API] ${url} returned non-JSON text.`)
    }
  }

  return payload
}

function unwrapPortalData<T>(payload: unknown, url: string): T {
  const normalized = normalizePortalPayload(payload, url)

  if (isRecord(normalized) && 'code' in normalized && !isSuccessCode(normalized.code)) {
    throw new Error(`[Portal API] ${url} failed: ${getMessage(normalized) || normalized.code}`)
  }

  if (isRecord(normalized) && 'data' in normalized) {
    return normalized.data as T
  }

  return normalized as T
}

async function getPortal<T>(url: string): Promise<T> {
  const response = await http.get(url)
  return unwrapPortalData<T>(response.data, url)
}

export function getSiteConfig() {
  return getPortal('/portal/api/site/config')
}

export function getHomeBanner() {
  return getPortal('/portal/api/site/home-banner')
}

export function getNavigation() {
  return getPortal('/portal/api/site/navigation')
}

export function getHomeMetrics() {
  return getPortal('/portal/api/site/home-metrics')
}

export function getHonors() {
  return getPortal('/portal/api/site/honors')
}
