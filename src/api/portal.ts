import http from './http'
import {
  cases,
  contactInfo,
  cooperationDirectionTags,
  aiCards,
  capabilities,
  clientLogos,
  industrySolutions,
  products,
  strengthMetrics,
} from '../data/site'

type PortalProductResponse = {
  id?: string | number
  name?: unknown
  logoUrl?: unknown
  subTitle?: unknown
  abstractText?: unknown
  statusTag?: unknown
  detailLink?: unknown
  title?: unknown
  sub?: unknown
  desc?: unknown
  status?: unknown
}

type PortalProduct = {
  id: string | number
  title: string
  logoUrl: string
  sub: string
  desc: string
  status: string
  detailLink: string
}

type PortalCaseResponse = {
  title?: unknown
  logoUrl?: unknown
  summary?: unknown
  keywords?: unknown
  img?: unknown
  desc?: unknown
  tags?: unknown
}

type PortalCase = {
  title: string
  img: string
  desc: string
  tags: string[]
}

type PortalContactInfoResponse = {
  contactAddress?: unknown
  businessPhone?: unknown
  contactEmail?: unknown
  address?: unknown
  phone?: unknown
  email?: unknown
}

type PortalContactInfo = {
  address: string
  phone: string
  email: string
}

type PortalIndustrySolutionResponse = {
  name?: unknown
  iconUrl?: unknown
  description?: unknown
  customerTags?: unknown
}

type PortalIndustrySolution = {
  name: string
  iconUrl: string
  description: string
  customerTags: string[]
}

type PortalCooperationDirectionTagResponse = {
  tagText?: unknown
  label?: unknown
}

type PortalCooperationDirectionTag = {
  tagText: string
  label: string
}

type PortalLeadPayload = {
  contactName?: unknown
  companyName?: unknown
  email?: unknown
  phone?: unknown
  demandContent?: unknown
  name?: unknown
  company?: unknown
  demandDescription?: unknown
}

type PortalStrengthMetricResponse = {
  id?: string | number
  metricValue?: unknown
  value?: unknown
  label?: unknown
  iconUrl?: unknown
}

type PortalStrengthMetric = {
  id: string | number
  value: string
  label: string
  iconUrl: string
}

type PortalClientLogoResponse = {
  id?: string | number
  name?: unknown
  industry?: unknown
  logoUrl?: unknown
}

type PortalClientLogo = {
  id: string | number
  name: string
  industry: string
  logoUrl: string
}

type PortalAiCardResponse = {
  id?: string | number
  name?: unknown
  englishName?: unknown
  iconUrl?: unknown
  description?: unknown
  jumpLink?: unknown
  title?: unknown
  en?: unknown
  text?: unknown
}

type PortalAiCard = {
  id: string | number
  title: string
  en: string
  iconUrl: string
  text: string
  jumpLink: string
}

type PortalCapabilityResponse = {
  id?: string | number
  name?: unknown
  items?: unknown
}

type PortalCapability = {
  id: string | number
  name: string
  items: {
    id: string | number
    name: string
  }[]
}

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

async function postPortal<T>(url: string, payload: unknown): Promise<T> {
  const response = await http.post(url, payload)
  return unwrapPortalData<T>(response.data, url)
}

function asString(value: unknown) {
  return value === undefined || value === null ? '' : String(value)
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(asString) : []
}

function assertArray<T>(value: T, methodName: string, path: string): T & unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`[Portal API] ${methodName} ${path} expected array data.`)
  }

  return value
}

function logPortalGetError(name: string, path: string, error: unknown) {
  console.error('[Portal API] 接口请求失败:', {
    name,
    path,
    error,
  })
}

async function getPortalWithMock<T>(
  name: string,
  path: string,
  mapper: (value: unknown) => T,
  mockValue: unknown,
) {
  try {
    return mapper(await getPortal<unknown>(path))
  } catch (error) {
    logPortalGetError(name, path, error)
    return mapper(mockValue)
  }
}

function mapPortalProduct(item: PortalProductResponse): PortalProduct {
  return {
    id: item.id ?? '',
    title: asString(item.name ?? item.title),
    logoUrl: asString(item.logoUrl),
    sub: asString(item.subTitle ?? item.sub),
    desc: asString(item.abstractText ?? item.desc),
    status: asString(item.statusTag ?? item.status),
    detailLink: asString(item.detailLink),
  }
}

function mapPortalProducts(data: unknown) {
  return assertArray(data, 'getPortalProducts', '/portal/api/products').map((item) =>
    mapPortalProduct(isRecord(item) ? item : {}),
  )
}

function mapPortalCase(item: PortalCaseResponse): PortalCase {
  return {
    title: asString(item.title),
    img: asString(item.logoUrl ?? item.img),
    desc: asString(item.summary ?? item.desc),
    tags: asStringArray(item.keywords ?? item.tags),
  }
}

function mapPortalCases(data: unknown) {
  return assertArray(data, 'getPortalCases', '/portal/api/cases').map((item) =>
    mapPortalCase(isRecord(item) ? item : {}),
  )
}

function mapPortalContactInfo(data: unknown): PortalContactInfo {
  const item = isRecord(data) ? data : {}

  return {
    address: asString(item.contactAddress ?? item.address),
    phone: asString(item.businessPhone ?? item.phone),
    email: asString(item.contactEmail ?? item.email),
  }
}

function mapPortalIndustrySolution(item: PortalIndustrySolutionResponse): PortalIndustrySolution {
  return {
    name: asString(item.name),
    iconUrl: asString(item.iconUrl),
    description: asString(item.description),
    customerTags: asStringArray(item.customerTags),
  }
}

function mapPortalIndustrySolutions(data: unknown) {
  return assertArray(data, 'getPortalIndustrySolutions', '/portal/api/industry-solutions').map((item) =>
    mapPortalIndustrySolution(isRecord(item) ? item : {}),
  )
}

function mapPortalCooperationDirectionTag(
  item: PortalCooperationDirectionTagResponse,
): PortalCooperationDirectionTag {
  const tagText = asString(item.tagText ?? item.label)

  return {
    tagText,
    label: tagText,
  }
}

function mapPortalCooperationDirectionTags(data: unknown) {
  return assertArray(data, 'getPortalCooperationDirectionTags', '/portal/api/cooperation-direction-tags').map((item) =>
    mapPortalCooperationDirectionTag(isRecord(item) ? item : {}),
  )
}

function trimString(value: unknown) {
  return asString(value).trim()
}

function mapPortalLeadPayload(payload: PortalLeadPayload) {
  return {
    name: trimString(payload.contactName ?? payload.name),
    company: trimString(payload.companyName ?? payload.company),
    email: trimString(payload.email),
    phone: trimString(payload.phone),
    demandDescription: trimString(payload.demandContent ?? payload.demandDescription),
  }
}

function mapPortalStrengthMetric(item: PortalStrengthMetricResponse): PortalStrengthMetric {
  return {
    id: item.id ?? '',
    value: asString(item.metricValue ?? item.value),
    label: asString(item.label),
    iconUrl: asString(item.iconUrl),
  }
}

function mapPortalStrengthMetrics(data: unknown) {
  return assertArray(data, 'getPortalStrengthMetrics', '/portal/api/site/strength-metrics').map((item) =>
    mapPortalStrengthMetric(isRecord(item) ? item : {}),
  )
}

function mapPortalClientLogo(item: PortalClientLogoResponse): PortalClientLogo {
  return {
    id: item.id ?? '',
    name: asString(item.name),
    industry: asString(item.industry),
    logoUrl: asString(item.logoUrl),
  }
}

function mapPortalClientLogos(data: unknown) {
  return assertArray(data, 'getPortalClientLogos', '/portal/api/site/client-logos').map((item) =>
    mapPortalClientLogo(isRecord(item) ? item : {}),
  )
}

function mapPortalAiCard(item: PortalAiCardResponse): PortalAiCard {
  return {
    id: item.id ?? '',
    title: asString(item.name ?? item.title),
    en: asString(item.englishName ?? item.en),
    iconUrl: asString(item.iconUrl),
    text: asString(item.description ?? item.text),
    jumpLink: asString(item.jumpLink),
  }
}

function mapPortalAiCards(data: unknown) {
  return assertArray(data, 'getPortalAiCards', '/portal/api/site/ai-cards').map((item) =>
    mapPortalAiCard(isRecord(item) ? item : {}),
  )
}

function mapPortalCapability(item: PortalCapabilityResponse): PortalCapability {
  const items = Array.isArray(item.items)
    ? item.items.map((child) => {
        const record = isRecord(child) ? child : {}

        return {
          id: record.id ?? '',
          name: asString(record.name),
        }
      })
    : []

  return {
    id: item.id ?? '',
    name: asString(item.name),
    items,
  }
}

function mapPortalCapabilities(data: unknown) {
  return assertArray(data, 'getPortalCapabilities', '/portal/api/site/capabilities').map((item) =>
    mapPortalCapability(isRecord(item) ? item : {}),
  )
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

export function getPortalProducts() {
  return getPortalWithMock('getPortalProducts', '/portal/api/products', mapPortalProducts, products)
}

export function getPortalCases() {
  return getPortalWithMock('getPortalCases', '/portal/api/cases', mapPortalCases, cases)
}

export function getPortalContactInfo() {
  return getPortalWithMock('getPortalContactInfo', '/portal/api/contact-info', mapPortalContactInfo, contactInfo)
}

export function getPortalIndustrySolutions() {
  return getPortalWithMock(
    'getPortalIndustrySolutions',
    '/portal/api/industry-solutions',
    mapPortalIndustrySolutions,
    industrySolutions,
  )
}

export function getPortalCooperationDirectionTags() {
  return getPortalWithMock(
    'getPortalCooperationDirectionTags',
    '/portal/api/cooperation-direction-tags',
    mapPortalCooperationDirectionTags,
    cooperationDirectionTags,
  )
}

export function getPortalStrengthMetrics() {
  return getPortalWithMock(
    'getPortalStrengthMetrics',
    '/portal/api/site/strength-metrics',
    mapPortalStrengthMetrics,
    strengthMetrics,
  )
}

export function getPortalClientLogos() {
  return getPortalWithMock(
    'getPortalClientLogos',
    '/portal/api/site/client-logos',
    mapPortalClientLogos,
    clientLogos,
  )
}

export function getPortalAiCards() {
  return getPortalWithMock('getPortalAiCards', '/portal/api/site/ai-cards', mapPortalAiCards, aiCards)
}

export function getPortalCapabilities() {
  return getPortalWithMock(
    'getPortalCapabilities',
    '/portal/api/site/capabilities',
    mapPortalCapabilities,
    capabilities,
  )
}

export function submitPortalLead(payload: PortalLeadPayload) {
  return postPortal('/portal/api/leads', mapPortalLeadPayload(payload))
}
