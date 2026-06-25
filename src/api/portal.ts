import http from './http'

function unwrapPortalData<T>(payload: T | { data?: T }): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data?: T }).data as T
  }

  return payload as T
}

async function getPortal<T>(url: string): Promise<T> {
  const response = await http.get(url)
  return unwrapPortalData<T>(response.data)
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
