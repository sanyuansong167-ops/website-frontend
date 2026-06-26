<template>
  <header class="site-header">
    <router-link class="brand" to="/">
      <img v-if="siteConfig.logo" class="logo-image" :src="siteConfig.logo" :alt="siteConfig.name" @error="siteConfig.logo = ''" />
      <div v-else class="logo-mark">{{ siteConfig.logoText }}</div>
      <div><strong>{{ siteConfig.name }}</strong><span>{{ siteConfig.slogan }}</span></div>
    </router-link>
    <nav class="top-nav">
      <a
        v-for="item in navItems"
        :key="item.key"
        :href="item.href"
        :target="item.target"
        :rel="item.rel"
        :class="{ active: activeId === item.activeId }"
        @click="handleNavClick(item, $event)"
      >{{ item.label }}</a>
    </nav>
  </header>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getNavigation, getSiteConfig } from '../api/portal'
import { navigation as defaultNavigation, siteConfig as defaultSiteConfig } from '../data/site'

const router = useRouter()
const navItems = ref([])
const siteConfig = ref({
  ...defaultSiteConfig,
  seo: { ...defaultSiteConfig.seo },
})

const sectionIdByLabel = defaultNavigation.reduce((map, item) => {
  map[item.label] = item.id
  return map
}, {})

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function asBoolean(value) {
  return value === true || value === 1 || value === '1' || asText(value).toLowerCase() === 'true'
}

function getNavigationSource(data) {
  if (Array.isArray(data)) return data
  if (isRecord(data) && Array.isArray(data.list)) return data.list
  if (isRecord(data) && Array.isArray(data.records)) return data.records
  return []
}

function normalizeAnchor(value) {
  return asText(value).replace(/^#/, '')
}

function getFallbackSectionId(item, label) {
  const pathMap = {
    '/products': 'products',
    '/cases': 'cases',
    '/about': 'about',
    '/contact': 'contact',
  }

  const rawLink = asText(item.href || item.url || item.path || item.link || item.routePath)
  const hash = rawLink.match(/#([^#/?]+)/)
  if (hash?.[1]) return hash[1]

  return normalizeAnchor(item.anchorCode) || pathMap[rawLink] || sectionIdByLabel[label] || asText(item.id || item.menuCode || item.code || item.key)
}

function normalizeTargetType(value, item) {
  const targetType = asText(value).toUpperCase()
  if (targetType) return targetType
  if (asText(item.externalUrl)) return 'EXTERNAL_LINK'
  if (normalizeAnchor(item.anchorCode)) return 'PAGE_ANCHOR'
  if (asText(item.routePath)) return 'INTERNAL_ROUTE'
  return 'PAGE_ANCHOR'
}

function getPageAnchorLocation(routePath, anchorCode) {
  const path = routePath || '/'
  const hash = anchorCode ? `#${anchorCode}` : ''

  return {
    href: `${path}${hash}`,
    routeLocation: { path, hash },
    activeId: anchorCode,
  }
}

function getNavigationDestination(item, label, targetType) {
  const routePath = asText(item.routePath || item.path || item.url || item.href || item.link)
  const anchorCode = normalizeAnchor(item.anchorCode)
  const externalUrl = asText(item.externalUrl || item.url || item.href || item.link)
  const fallbackSectionId = getFallbackSectionId(item, label)

  if (targetType === 'EXTERNAL_LINK') {
    const openInNewTab = asBoolean(item.openInNewTab)

    return {
      href: externalUrl || '#',
      routeLocation: null,
      activeId: asText(item.id) || externalUrl || label,
      target: openInNewTab ? '_blank' : null,
      rel: openInNewTab ? 'noopener noreferrer' : null,
    }
  }

  if (targetType === 'INTERNAL_ROUTE') {
    return {
      href: routePath || '/',
      routeLocation: routePath || '/',
      activeId: fallbackSectionId,
      target: null,
      rel: null,
    }
  }

  if (targetType === 'GROUP') {
    return {
      href: '#',
      routeLocation: null,
      activeId: asText(item.id) || label,
      target: null,
      rel: null,
    }
  }

  return {
    ...getPageAnchorLocation(routePath, anchorCode || fallbackSectionId),
    target: null,
    rel: null,
  }
}

function mapNavigationItem(item) {
  if (!isRecord(item)) return null

  const label = asText(item.menuName || item.label || item.name || item.title)
  if (!label) return null

  const targetType = normalizeTargetType(item.targetType, item)
  const destination = getNavigationDestination(item, label, targetType)
  const key = asText(item.id || item.menuCode || item.code || item.key) || `${targetType}:${destination.href}:${label}`

  const children = getNavigationSource(item.children)
    .map(mapNavigationItem)
    .filter(Boolean)

  return {
    ...item,
    key,
    label,
    targetType,
    ...destination,
    submenu: children,
  }
}

function mapNavigation(data) {
  const mapped = getNavigationSource(data)
    .map(mapNavigationItem)
    .filter(Boolean)

  return mapped.length ? mapped : null
}

navItems.value = mapNavigation(defaultNavigation) || []

function mapSiteConfig(data) {
  if (!isRecord(data)) return null

  return {
    logo: asText(data.logoLightUrl || data.logoDarkUrl) || defaultSiteConfig.logo,
    logoText: defaultSiteConfig.logoText,
    name: asText(data.siteTitle) || defaultSiteConfig.name,
    slogan: asText(data.brandSlogan || data.brandTagline) || defaultSiteConfig.slogan,
    seo: {
      title: asText(data.siteTitle) || defaultSiteConfig.seo.title,
      description: asText(data.seoDescription) || defaultSiteConfig.seo.description,
      keywords: asText(data.seoKeywords) || asText(defaultSiteConfig.seo.keywords),
    },
  }
}

function applySeo(seo) {
  if (!seo) return

  document.title = seo.title || defaultSiteConfig.seo.title

  let description = document.querySelector('meta[name="description"]')
  if (!description) {
    description = document.createElement('meta')
    description.setAttribute('name', 'description')
    document.head.appendChild(description)
  }
  description.setAttribute('content', seo.description || defaultSiteConfig.seo.description)

  if (seo.keywords) {
    let keywords = document.querySelector('meta[name="keywords"]')
    if (!keywords) {
      keywords = document.createElement('meta')
      keywords.setAttribute('name', 'keywords')
      document.head.appendChild(keywords)
    }
    keywords.setAttribute('content', seo.keywords)
  }
}

async function loadNavigation() {
  try {
    const data = await getNavigation()
    const mapped = mapNavigation(data)
    if (mapped) navItems.value = mapped
  } catch (error) {
    console.error('[Portal API] navigation failed, fallback to site.js', error)
  }
}

async function loadSiteConfig() {
  try {
    const data = await getSiteConfig()
    const mapped = mapSiteConfig(data)
    if (mapped) {
      siteConfig.value = mapped
      applySeo(mapped.seo)
    }
  } catch (error) {
    console.error('[Portal API] site-config failed, fallback to site.js', error)
  }
}

function handleNavClick(item, event) {
  setActive(item.activeId)

  if (item.targetType === 'EXTERNAL_LINK') return

  event.preventDefault()
  if (!item.routeLocation) return

  router.push(item.routeLocation).then(() => {
    nextTick(updateActive)
  })
}
const sectionMap = [
  { sectionId: 'ai', navId: 'ai' },
  { sectionId: 'products', navId: 'products' },
  { sectionId: 'innovation', navId: 'innovation' },
  { sectionId: 'cases', navId: 'cases' },
  { sectionId: 'about', navId: 'about' },
  { sectionId: 'strength', navId: 'about' },
  { sectionId: 'values', navId: 'about' },
  { sectionId: 'contact', navId: 'contact' },
]

const activeId = ref('')
let ticking = false

function setActive(id) {
  activeId.value = id
}

function updateActive() {
  ticking = false

  if (window.location.pathname !== '/') {
    activeId.value = ''
    return
  }

  const marker = 120
  let current = ''

  for (const item of sectionMap) {
    const section = document.getElementById(item.sectionId)
    if (!section) continue

    const rect = section.getBoundingClientRect()
    if (rect.top <= marker && rect.bottom > marker) {
      current = item.navId
      break
    }

    if (rect.top <= marker) {
      current = item.navId
    }
  }

  activeId.value = current
}

function requestActiveUpdate() {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(updateActive)
}

onMounted(() => {
  loadNavigation()
  loadSiteConfig()
  applySeo(siteConfig.value.seo)
  nextTick(updateActive)
  window.addEventListener('scroll', requestActiveUpdate, { passive: true })
  window.addEventListener('hashchange', updateActive)
  window.addEventListener('resize', requestActiveUpdate)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', requestActiveUpdate)
  window.removeEventListener('hashchange', updateActive)
  window.removeEventListener('resize', requestActiveUpdate)
})
</script>

<style scoped>
.logo-image {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  object-fit: contain;
}
</style>
