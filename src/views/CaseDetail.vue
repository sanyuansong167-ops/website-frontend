<template>
  <SiteHeader />
  <main class="detail-page soft case-detail-page">
    <section class="section">
      <div class="container">
        <SectionTitle
          :tag="caseDetailContent.tag"
          :title="pageTitle"
          :desc="pageDescription"
        />

        <div v-if="loading" class="detail-state">{{ caseDetailContent.loadingText }}</div>

        <div v-else-if="notFound" class="detail-state error">
          {{ caseDetailContent.notFoundText }}
        </div>

        <template v-else-if="caseDetail">
          <article class="case-detail">
            <img v-if="coverImage" :src="coverImage" :alt="caseDetail.title">
            <div>
              <h2>{{ caseDetail.title }}</h2>
              <b>{{ caseMeta }}</b>
              <p>{{ caseDetail.background }}</p>
              <span v-if="caseDetail.industry">{{ caseDetail.industry }}</span>
              <span v-if="caseDetail.customerName">{{ caseDetail.customerName }}</span>
              <blockquote>{{ caseDetail.result || caseDetail.solution || caseDetail.background }}</blockquote>
              <div v-if="richContent" class="rich-content" v-html="richContent"></div>
              <div v-else class="detail-empty">{{ caseDetailContent.emptyContentText }}</div>
            </div>
          </article>

          <section v-if="hasCaseRecommendations" class="recommendation-section">
            <div v-if="relatedProducts.length" class="recommendation-group">
              <h3>{{ caseDetailContent.relatedProductsTitle }}</h3>
              <div class="recommendation-grid">
                <RouterLink
                  v-for="item in relatedProducts"
                  :key="`product-${item.id}`"
                  class="recommendation-card"
                  :to="`/product/${item.id}`"
                >
                  <img v-if="item.logoUrl" :src="item.logoUrl" :alt="item.title">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.desc }}</p>
                </RouterLink>
              </div>
            </div>

            <div v-if="recommendedCases.length" class="recommendation-group">
              <h3>{{ caseDetailContent.recommendedCasesTitle }}</h3>
              <div class="recommendation-grid">
                <RouterLink
                  v-for="item in recommendedCases"
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
          </section>
        </template>

        <div v-else class="detail-state">{{ caseDetailContent.emptyDetailText }}</div>
      </div>
    </section>
  </main>
  <FooterSection />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getPortalCaseDetail,
  getPortalCases,
} from '../api/portal'
import { caseDetailPageSectionFallbacks, getPortalPageSections } from '../api/pageSection'
import SiteHeader from '../components/SiteHeader.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionTitle from '../components/SectionTitle.vue'

const route = useRoute()
const loading = ref(false)
const notFound = ref(false)
const caseDetail = ref(null)
const pageSectionMap = ref({})

const caseDetailContent = computed(() => {
  const hero = pageSectionMap.value.hero || {}
  const heroPayload = sectionPayload('hero')
  const statesPayload = sectionPayload('states')
  const recommendationsPayload = sectionPayload('recommendations')
  const seoPayload = sectionPayload('seo')

  return {
    tag: firstText(heroPayload.tag, hero.title, caseDetailPageSectionFallbacks.hero.tag),
    description: firstText(hero.description, heroPayload.description, caseDetailPageSectionFallbacks.hero.description),
    loadingText: firstText(statesPayload.loadingText, caseDetailPageSectionFallbacks.states.loadingText),
    notFoundText: firstText(statesPayload.notFoundText, caseDetailPageSectionFallbacks.states.notFoundText),
    emptyContentText: firstText(statesPayload.emptyContentText, caseDetailPageSectionFallbacks.states.emptyContentText),
    emptyDetailText: firstText(statesPayload.emptyDetailText, caseDetailPageSectionFallbacks.states.emptyDetailText),
    relatedProductsTitle: firstText(recommendationsPayload.relatedProductsTitle, caseDetailPageSectionFallbacks.recommendations.relatedProductsTitle),
    recommendedCasesTitle: firstText(recommendationsPayload.recommendedCasesTitle, caseDetailPageSectionFallbacks.recommendations.recommendedCasesTitle),
    defaultTitle: firstText(seoPayload.defaultTitle, caseDetailPageSectionFallbacks.seo.defaultTitle),
    titleSuffix: firstText(seoPayload.titleSuffix, caseDetailPageSectionFallbacks.seo.titleSuffix),
  }
})
const pageTitle = computed(() => caseDetail.value?.title || caseDetailContent.value.defaultTitle)
const pageDescription = computed(() => caseDetail.value?.background || caseDetailContent.value.description)
const coverImage = computed(() => caseDetail.value?.coverUrl || caseDetail.value?.images?.[0] || '')
const caseMeta = computed(() => {
  const parts = [caseDetail.value?.customerName, caseDetail.value?.industry].filter(Boolean)
  return parts.join(' / ')
})
const richContent = computed(() => caseDetail.value?.content || fallbackContent(caseDetail.value?.background))
const relatedProducts = computed(() => caseDetail.value?.relatedProducts || [])
const recommendedCases = computed(() => caseDetail.value?.recommendedCases || [])
const hasCaseRecommendations = computed(() => relatedProducts.value.length > 0 || recommendedCases.value.length > 0)

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
    console.error(`[Portal API] case-detail page-section ${section.sectionCode} contentJson invalid`, error)
    return {}
  }
}

function sectionPayload(sectionCode) {
  return parseSectionContent(pageSectionMap.value[sectionCode])
}

async function loadCaseDetailSections() {
  try {
    const sections = await getPortalPageSections('case-detail')
    const map = {}
    if (Array.isArray(sections)) {
      sections.forEach((section) => {
        if (section?.sectionCode) map[section.sectionCode] = section
      })
    }
    pageSectionMap.value = map
  } catch (error) {
    console.error('[Portal API] case-detail page-sections failed, fallback to default copy', error)
    pageSectionMap.value = {}
  }
}

async function resolveCaseId() {
  const id = route.params.id
  if (Array.isArray(id)) return id[0]
  if (id) return id

  const list = await getPortalCases()
  return Array.isArray(list) && list[0]?.id ? list[0].id : ''
}

async function loadCase() {
  loading.value = true
  notFound.value = false
  caseDetail.value = null

  try {
    const id = await resolveCaseId()
    if (!id) {
      notFound.value = true
      return
    }

    const detail = await getPortalCaseDetail(id)
    if (!detail?.id) {
      notFound.value = true
      return
    }

    caseDetail.value = detail
    applySeo(detail.seoTitle || detail.title, detail.seoDescription || detail.background)
  } catch (error) {
    console.error('[Portal API] case detail failed', error)
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

function applySeo(title, description) {
  const suffix = caseDetailContent.value.titleSuffix
  const defaultTitle = caseDetailContent.value.defaultTitle
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
  loadCaseDetailSections()
  loadCase()
})
watch(() => route.params.id, loadCase)
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

.case-detail {
  align-items: start;
}

.case-detail img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
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
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
}
</style>
