import http, { unwrapApiData } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

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

export type AdminSiteModuleConfig = {
  key: string
  title: string
  listPath: string
  createPath?: string
  updatePath?: string
  deletePath?: string
  reorderPath?: string
  visibilityPath?: string
  singleton?: boolean
  idField?: string
  versionField?: string
  orderMethod?: 'post' | 'put'
  deleteVersionQuery?: boolean
}

export const adminSiteModuleConfigs: AdminSiteModuleConfig[] = [
  {
    key: 'home-metrics',
    title: '首页指标',
    listPath: '/admin/api/site/home-metrics',
    createPath: '/admin/api/site/home-metrics',
    updatePath: '/admin/api/site/home-metrics/{id}',
    deletePath: '/admin/api/site/home-metrics/{id}',
    reorderPath: '/admin/api/site/home-metrics/order',
    visibilityPath: '/admin/api/site/home-metrics/{id}/visibility',
    idField: 'metricId',
    orderMethod: 'put',
  },
  {
    key: 'navigation',
    title: '导航菜单',
    listPath: '/admin/api/site/navigation/menus',
    createPath: '/admin/api/site/navigation/menus',
    updatePath: '/admin/api/site/navigation/menus/{id}',
    deletePath: '/admin/api/site/navigation/menus/{id}',
    reorderPath: '/admin/api/site/navigation/menus/order',
    visibilityPath: '/admin/api/site/navigation/menus/{id}/visibility',
    idField: 'menuId',
    orderMethod: 'put',
  },
  {
    key: 'honors',
    title: '荣誉资质',
    listPath: '/admin/api/site/honors',
    createPath: '/admin/api/site/honors',
    updatePath: '/admin/api/site/honors/{id}',
    deletePath: '/admin/api/site/honors/{id}',
    reorderPath: '/admin/api/site/honors/batch-sort',
    idField: 'honorId',
    orderMethod: 'put',
  },
  {
    key: 'ai-cards',
    title: 'AI 卡片',
    listPath: '/admin/api/site/ai-cards',
    createPath: '/admin/api/site/ai-cards',
    updatePath: '/admin/api/site/ai-cards/{id}',
    deletePath: '/admin/api/site/ai-cards/{id}',
    reorderPath: '/admin/api/site/ai-cards/batch-sort',
    orderMethod: 'put',
    deleteVersionQuery: true,
  },
  {
    key: 'capability-categories',
    title: '能力底座分类',
    listPath: '/admin/api/site/capability-categories',
    createPath: '/admin/api/site/capability-categories',
    updatePath: '/admin/api/site/capability-categories/{id}',
    deletePath: '/admin/api/site/capability-categories/{id}',
    reorderPath: '/admin/api/site/capability-categories/batch-sort',
    orderMethod: 'put',
  },
  {
    key: 'capability-items',
    title: '能力底座子项',
    listPath: '/admin/api/site/capability-categories',
    createPath: '/admin/api/site/capability-items',
    updatePath: '/admin/api/site/capability-items/{id}',
    deletePath: '/admin/api/site/capability-items/{id}',
    reorderPath: '/admin/api/site/capability-items/batch-sort',
    orderMethod: 'put',
  },
  {
    key: 'client-logos',
    title: '客户 Logo',
    listPath: '/admin/api/site/client-logos',
    createPath: '/admin/api/site/client-logos',
    updatePath: '/admin/api/site/client-logos/{id}',
    deletePath: '/admin/api/site/client-logos/{id}',
    reorderPath: '/admin/api/site/client-logos/batch-sort',
    idField: 'clientLogoId',
    orderMethod: 'put',
  },
  {
    key: 'strength-metrics',
    title: '实力指标',
    listPath: '/admin/api/site/strength-metrics',
    createPath: '/admin/api/site/strength-metrics',
    updatePath: '/admin/api/site/strength-metrics/{id}',
    deletePath: '/admin/api/site/strength-metrics/{id}',
    reorderPath: '/admin/api/site/strength-metrics/batch-sort',
    orderMethod: 'put',
  },
  {
    key: 'partner-universities',
    title: '合作高校',
    listPath: '/admin/api/partner-universities',
    createPath: '/admin/api/partner-universities',
    updatePath: '/admin/api/partner-universities/{id}',
    deletePath: '/admin/api/partner-universities/{id}',
    reorderPath: '/admin/api/partner-universities/reorder',
  },
  {
    key: 'research-directions',
    title: '研发方向',
    listPath: '/admin/api/research-directions',
    createPath: '/admin/api/research-directions',
    updatePath: '/admin/api/research-directions/{id}',
    deletePath: '/admin/api/research-directions/{id}',
    reorderPath: '/admin/api/research-directions/reorder',
  },
  {
    key: 'timeline-events',
    title: '时间线',
    listPath: '/admin/api/timeline-events',
    createPath: '/admin/api/timeline-events',
    updatePath: '/admin/api/timeline-events/{id}',
    deletePath: '/admin/api/timeline-events/{id}',
    reorderPath: '/admin/api/timeline-events/reorder',
  },
  {
    key: 'value-cards',
    title: '价值卡片',
    listPath: '/admin/api/value-cards',
    createPath: '/admin/api/value-cards',
    updatePath: '/admin/api/value-cards/{id}',
    deletePath: '/admin/api/value-cards/{id}',
    reorderPath: '/admin/api/value-cards/reorder',
  },
  {
    key: 'promise-content',
    title: '承诺内容',
    listPath: '/admin/api/promise-content',
    updatePath: '/admin/api/promise-content',
    singleton: true,
  },
  {
    key: 'promise-tags',
    title: '承诺标签',
    listPath: '/admin/api/promise-tags',
    createPath: '/admin/api/promise-tags',
    updatePath: '/admin/api/promise-tags/{id}',
    deletePath: '/admin/api/promise-tags/{id}',
    reorderPath: '/admin/api/promise-tags/reorder',
  },
  {
    key: 'content-tags',
    title: '内容标签',
    listPath: '/admin/api/content-tags',
    createPath: '/admin/api/content-tags',
    updatePath: '/admin/api/content-tags/{id}',
    deletePath: '/admin/api/content-tags/{id}',
    reorderPath: '/admin/api/content-tags/reorder',
    deleteVersionQuery: true,
  },
  {
    key: 'content-categories',
    title: '内容分类',
    listPath: '/admin/api/content-categories',
    createPath: '/admin/api/content-categories',
    updatePath: '/admin/api/content-categories/{id}',
    deletePath: '/admin/api/content-categories/{id}',
    reorderPath: '/admin/api/content-categories/reorder',
    deleteVersionQuery: true,
  },
  {
    key: 'content-relations',
    title: '内容关联',
    listPath: '/admin/api/content-relations',
    createPath: '/admin/api/content-relations',
    updatePath: '/admin/api/content-relations/{id}',
    deletePath: '/admin/api/content-relations/{id}',
    deleteVersionQuery: true,
  },
  {
    key: 'content-references',
    title: '内容引用',
    listPath: '/admin/api/content-references',
    createPath: '/admin/api/content-references',
    updatePath: '/admin/api/content-references/{id}',
    deletePath: '/admin/api/content-references/{id}',
    deleteVersionQuery: true,
  },
  {
    key: 'business-registry',
    title: '业务中心',
    listPath: '/admin/api/business-registry',
    createPath: '/admin/api/business-registry',
    updatePath: '/admin/api/business-registry/{id}',
    deletePath: '/admin/api/business-registry/{id}',
    reorderPath: '/admin/api/business-registry/reorder',
    deleteVersionQuery: true,
  },
  {
    key: 'industry-solutions',
    title: '行业方案',
    listPath: '/admin/api/industry-solutions',
    createPath: '/admin/api/industry-solutions',
    updatePath: '/admin/api/industry-solutions/{id}',
    deletePath: '/admin/api/industry-solutions/{id}',
    reorderPath: '/admin/api/industry-solutions/reorder',
  },
  {
    key: 'cooperation-direction-tags',
    title: '合作方向标签',
    listPath: '/admin/api/cooperation-direction-tags',
    createPath: '/admin/api/cooperation-direction-tags',
    updatePath: '/admin/api/cooperation-direction-tags/{id}',
    deletePath: '/admin/api/cooperation-direction-tags/{id}',
    reorderPath: '/admin/api/cooperation-direction-tags/reorder',
  },
]

export function getAdminSiteModuleConfig(key: string) {
  return adminSiteModuleConfigs.find((item) => item.key === key)
}

function replaceId(path: string, id: string | number) {
  return path.replace('{id}', encodeURIComponent(String(id)))
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
  return requestAdminWithCsrf<AdminSiteConfig>('put', '/admin/api/site/config', payload)
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
  return requestAdminWithCsrf<AdminHomeBanner>('put', '/admin/api/site/home-banner', payload)
}

export async function getAdminSiteModuleData(config: AdminSiteModuleConfig) {
  const response = await http.get(config.listPath, {
    params: config.key === 'ai-cards' ? { pageNo: 1, pageSize: 200 } : undefined,
  })
  return unwrapApiData<unknown>(response.data)
}

export async function createAdminSiteModuleItem(config: AdminSiteModuleConfig, payload: unknown) {
  if (!config.createPath) throw new Error('当前模块不支持新增')
  return requestAdminWithCsrf<unknown>('post', config.createPath, payload)
}

export async function updateAdminSiteModuleItem(
  config: AdminSiteModuleConfig,
  id: string | number | null,
  payload: unknown,
) {
  if (!config.updatePath) throw new Error('当前模块不支持编辑')
  const path = config.updatePath.includes('{id}')
    ? replaceId(config.updatePath, id ?? '')
    : config.updatePath
  return requestAdminWithCsrf<unknown>('put', path, payload)
}

export async function deleteAdminSiteModuleItem(
  config: AdminSiteModuleConfig,
  id: string | number,
  payload?: unknown,
) {
  if (!config.deletePath) throw new Error('当前模块不支持删除')
  let path = replaceId(config.deletePath, id)
  if (config.deleteVersionQuery) {
    const version = payload && typeof payload === 'object' && 'version' in payload ? (payload as { version?: unknown }).version : undefined
    if (version === undefined || version === null || version === '') {
      throw new Error('缺少版本号，请刷新后重试')
    }
    path = `${path}?version=${encodeURIComponent(String(version))}`
  }
  return requestAdminWithCsrf<unknown>('delete', path, config.deleteVersionQuery ? undefined : payload)
}

export async function reorderAdminSiteModule(config: AdminSiteModuleConfig, payload: unknown) {
  if (!config.reorderPath) throw new Error('当前模块不支持排序')
  return requestAdminWithCsrf<unknown>(config.orderMethod ?? 'post', config.reorderPath, payload)
}

export async function updateAdminSiteModuleVisibility(
  config: AdminSiteModuleConfig,
  id: string | number,
  payload: unknown,
) {
  if (!config.visibilityPath) throw new Error('当前模块不支持可见性更新')
  return requestAdminWithCsrf<unknown>('put', replaceId(config.visibilityPath, id), payload)
}
