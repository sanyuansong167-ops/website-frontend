<template>
  <SiteHeader />
  <main class="detail-page product-detail-page">
    <section class="section">
      <div class="container">
        <SectionTitle
          :tag="productDetailContent.tag"
          :title="pageTitle"
          :desc="pageDescription"
        />

        <div v-if="loading" class="detail-state">{{ productDetailContent.loadingText }}</div>

        <div v-else-if="notFound" class="detail-state error">
          {{ productDetailContent.notFoundText }}
        </div>

        <template v-else-if="product">
          <article class="detail-card product-detail-card">
            <div class="detail-media" v-if="product.coverUrl">
              <img :src="product.coverUrl" :alt="product.title">
            </div>
            <div class="detail-main">
              <div class="detail-meta">
                <span v-if="product.status">{{ product.status }}</span>
                <span v-if="product.updatedAt">{{ productDetailContent.updatedAtPrefix }} {{ formatDate(product.updatedAt) }}</span>
              </div>
              <h2>{{ product.title }}</h2>
              <p class="detail-desc">{{ product.description }}</p>
              <div v-if="richContent" class="rich-content" v-html="richContent"></div>
              <div v-else class="detail-empty">{{ productDetailContent.emptyContentText }}</div>
            </div>
          </article>

          <section v-if="hasProductRecommendations" class="recommendation-section">
            <div v-if="relatedCases.length" class="recommendation-group">
              <h3>{{ productDetailContent.relatedCasesTitle }}</h3>
              <div class="recommendation-grid">
                <RouterLink
                  v-for="item in relatedCases"
                  :key="`case-${item.id}`"
                  class="recommendation-card"
                  :to="`/case/${item.id}`"
                >
                  <img v-if="item.img" :src="item.img" :alt="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </RouterLink>
              </div>
            </div>

            <div v-if="relatedIndustrySolutions.length" class="recommendation-group">
              <h3>{{ productDetailContent.relatedIndustrySolutionsTitle }}</h3>
              <div class="recommendation-grid">
                <article
                  v-for="item in relatedIndustrySolutions"
                  :key="`industry-${item.id || item.name}`"
                  class="recommendation-card"
                >
                  <img v-if="item.iconUrl" :src="item.iconUrl" :alt="item.name">
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.description }}</p>
                </article>
              </div>
            </div>
          </section>
        </template>

        <div v-else class="detail-state">{{ productDetailContent.emptyDetailText }}</div>
      </div>
    </section>
  </main>
  <FooterSection />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getPortalProductDetail,
  getPortalProducts,
} from '../api/portal'
import { getPortalPageSections, productDetailPageSectionFallbacks } from '../api/pageSection'
import SiteHeader from '../components/SiteHeader.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionTitle from '../components/SectionTitle.vue'

const route = useRoute()
const loading = ref(false)
const notFound = ref(false)
const product = ref(null)
const pageSectionMap = ref({})

const productDetailContent = computed(() => {
  const hero = pageSectionMap.value.hero || {}
  const heroPayload = sectionPayload('hero')
  const statesPayload = sectionPayload('states')
  const recommendationsPayload = sectionPayload('recommendations')
  const seoPayload = sectionPayload('seo')

  return {
    tag: firstText(heroPayload.tag, hero.title, productDetailPageSectionFallbacks.hero.tag),
    description: firstText(hero.description, heroPayload.description, productDetailPageSectionFallbacks.hero.description),
    loadingText: firstText(statesPayload.loadingText, productDetailPageSectionFallbacks.states.loadingText),
    notFoundText: firstText(statesPayload.notFoundText, productDetailPageSectionFallbacks.states.notFoundText),
    emptyContentText: firstText(statesPayload.emptyContentText, productDetailPageSectionFallbacks.states.emptyContentText),
    emptyDetailText: firstText(statesPayload.emptyDetailText, productDetailPageSectionFallbacks.states.emptyDetailText),
    updatedAtPrefix: firstText(statesPayload.updatedAtPrefix, productDetailPageSectionFallbacks.states.updatedAtPrefix),
    relatedCasesTitle: firstText(recommendationsPayload.relatedCasesTitle, productDetailPageSectionFallbacks.recommendations.relatedCasesTitle),
    relatedIndustrySolutionsTitle: firstText(recommendationsPayload.relatedIndustrySolutionsTitle, productDetailPageSectionFallbacks.recommendations.relatedIndustrySolutionsTitle),
    defaultTitle: firstText(seoPayload.defaultTitle, productDetailPageSectionFallbacks.seo.defaultTitle),
    titleSuffix: firstText(seoPayload.titleSuffix, productDetailPageSectionFallbacks.seo.titleSuffix),
  }
})
const pageTitle = computed(() => product.value?.title || productDetailContent.value.defaultTitle)
const pageDescription = computed(() => product.value?.description || productDetailContent.value.description)
const richContent = computed(() => product.value?.content || fallbackContent(product.value?.description))
const relatedCases = computed(() => product.value?.relatedCases || [])
const relatedIndustrySolutions = computed(() => product.value?.relatedIndustrySolutions || [])
const hasProductRecommendations = computed(() => relatedCases.value.length > 0 || relatedIndustrySolutions.value.length > 0)

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function firstText(...values) {
  for (const value of values) {
    const text = asText(value)
    if (text) return text
  }

  return ''
}

function parseSectionContent(section) {
  if (!section?.contentJson) return {}

  try {
    const parsed = JSON.parse(section.contentJson)
    return isRecord(parsed) ? parsed : {}
  } catch (error) {
    console.error(`[Portal API] product-detail page-section ${section.sectionCode} contentJson invalid`, error)
    return {}
  }
}

function sectionPayload(sectionCode) {
  return parseSectionContent(pageSectionMap.value[sectionCode])
}

async function loadProductDetailSections() {
  try {
    const sections = await getPortalPageSections('product-detail')
    const map = {}
    if (Array.isArray(sections)) {
      sections.forEach((section) => {
        if (section?.sectionCode) map[section.sectionCode] = section
      })
    }
    pageSectionMap.value = map
  } catch (error) {
    console.error('[Portal API] product-detail page-sections failed, fallback to default copy', error)
    pageSectionMap.value = {}
  }
}

async function resolveProductId() {
  const id = route.params.id
  if (Array.isArray(id)) return id[0]
  if (id) return id

  const list = await getPortalProducts()
  return Array.isArray(list) && list[0]?.id ? list[0].id : ''
}

async function loadProduct() {
  loading.value = true
  notFound.value = false
  product.value = null

  try {
    const id = await resolveProductId()
    if (!id) {
      notFound.value = true
      return
    }

    const detail = await getPortalProductDetail(id)
    if (!detail?.id || detail.visible === false) {
      notFound.value = true
      return
    }

    product.value = detail
    applySeo(detail.seoTitle || detail.title, detail.seoDescription || detail.description)
  } catch (error) {
    console.error('[Portal API] product detail failed', error)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

function fallbackContent(value) {
  const text = String(value || '').trim()
  return text ? `<p>${escapeHtml(text)}</p>` : ''
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function applySeo(title, description) {
  const suffix = productDetailContent.value.titleSuffix
  const defaultTitle = productDetailContent.value.defaultTitle
  document.title = title ? `${title} - ${suffix}` : `${defaultTitle} - ${suffix}`
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', description || '')
}

onMounted(() => {
  loadProductDetailSections()
  loadProduct()
})
watch(() => route.params.id, loadProduct)
</script>

<style scoped>
.detail-state {
  padding: 56px 24px;
  text-align: center;
  color: #64748b;
}

.detail-state.error {
  color: #b42318;
}

.product-detail-card {
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(220px, 360px) minmax(0, 1fr);
  align-items: start;
}

.detail-media img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-meta span {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #334155;
  font-size: 13px;
}

.detail-desc {
  color: #475569;
}

.rich-content {
  margin-top: 22px;
  color: #334155;
  line-height: 1.9;
}

.detail-empty {
  margin-top: 22px;
  color: #94a3b8;
}

.recommendation-section {
  margin-top: 40px;
  display: grid;
  gap: 28px;
}

.recommendation-group h3 {
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 22px;
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.recommendation-card {
  display: grid;
  gap: 10px;
  min-height: 100%;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  background: #ffffff;
}

.recommendation-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 6px;
  background: #f8fafc;
}

.recommendation-card strong {
  color: #0f172a;
  font-size: 16px;
}

.recommendation-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

@media (max-width: 760px) {
  .product-detail-card {
    grid-template-columns: 1fr;
  }

  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
