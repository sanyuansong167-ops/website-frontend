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
        :key="item.id"
        :href="`/#${item.id}`"
        :class="{ active: activeId === item.id }"
        @click="setActive(item.id)"
      >{{ item.label }}</a>
    </nav>
  </header>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { getNavigation, getSiteConfig } from '../api/portal'
import { navigation as defaultNavigation, siteConfig as defaultSiteConfig } from '../data/site'

const navItems = ref(defaultNavigation.map((item) => ({ ...item })))
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

function getNavigationSource(data) {
  if (Array.isArray(data)) return data
  if (isRecord(data) && Array.isArray(data.list)) return data.list
  if (isRecord(data) && Array.isArray(data.records)) return data.records
  return []
}

function resolveNavId(item, label) {
  const rawId = asText(item.id || item.menuCode || item.code || item.key)
  if (rawId) return rawId

  const rawLink = asText(item.href || item.url || item.path || item.link)
  const hash = rawLink.match(/#([^#/?]+)/)
  if (hash?.[1]) return hash[1]

  const pathMap = {
    '/products': 'products',
    '/cases': 'cases',
    '/about': 'about',
    '/contact': 'contact',
  }

  return pathMap[rawLink] || sectionIdByLabel[label] || ''
}

function mapNavigationItem(item) {
  if (!isRecord(item)) return null

  const label = asText(item.menuName || item.label || item.name || item.title)
  const id = resolveNavId(item, label)
  if (!label || !id) return null

  const children = getNavigationSource(item.children)
    .map(mapNavigationItem)
    .filter(Boolean)

  return {
    ...item,
    id,
    label,
    submenu: children,
  }
}

function mapNavigation(data) {
  const mapped = getNavigationSource(data)
    .map(mapNavigationItem)
    .filter(Boolean)

  return mapped.length ? mapped : null
}

function mapSiteConfig(data) {
  if (!isRecord(data)) return null

  const seo = isRecord(data.seo) ? data.seo : {}

  return {
    logo: asText(data.logo || data.logoUrl) || defaultSiteConfig.logo,
    logoText: defaultSiteConfig.logoText,
    name: asText(data.name || data.siteName || data.companyName) || defaultSiteConfig.name,
    slogan: asText(data.slogan) || defaultSiteConfig.slogan,
    seo: {
      title: asText(seo.title) || defaultSiteConfig.seo.title,
      description: asText(seo.description) || defaultSiteConfig.seo.description,
      keywords: asText(seo.keywords),
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
