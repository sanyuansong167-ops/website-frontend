<template>
  <SiteHeader />
  <main class="detail-page product-detail-page">
    <section class="section">
      <div class="container">
        <SectionTitle
          tag="产品详情"
          :title="pageTitle"
          :desc="pageDescription"
        />

        <div v-if="loading" class="detail-state">正在加载产品详情...</div>

        <div v-else-if="notFound" class="detail-state error">
          未找到对应产品，可能已下线或链接已失效。
        </div>

        <template v-else-if="product">
          <article class="detail-card product-detail-card">
            <div class="detail-media" v-if="product.coverUrl">
              <img :src="product.coverUrl" :alt="product.title">
            </div>
            <div class="detail-main">
              <div class="detail-meta">
                <span v-if="product.status">{{ product.status }}</span>
                <span v-if="product.updatedAt">更新于 {{ formatDate(product.updatedAt) }}</span>
              </div>
              <h2>{{ product.title }}</h2>
              <p class="detail-desc">{{ product.description }}</p>
              <div v-if="richContent" class="rich-content" v-html="richContent"></div>
              <div v-else class="detail-empty">暂无更多详情内容。</div>
            </div>
          </article>

          <section v-if="hasProductRecommendations" class="recommendation-section">
            <div v-if="relatedCases.length" class="recommendation-group">
              <h3>相关案例</h3>
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
              <h3>相关行业方案</h3>
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

        <div v-else class="detail-state">暂无产品详情。</div>
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
import SiteHeader from '../components/SiteHeader.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionTitle from '../components/SectionTitle.vue'

const route = useRoute()
const loading = ref(false)
const notFound = ref(false)
const product = ref(null)

const pageTitle = computed(() => product.value?.title || '产品详情')
const pageDescription = computed(() => product.value?.description || '真实贴合行业业务场景的云台生产产品。')
const richContent = computed(() => product.value?.content || fallbackContent(product.value?.description))
const relatedCases = computed(() => product.value?.relatedCases || [])
const relatedIndustrySolutions = computed(() => product.value?.relatedIndustrySolutions || [])
const hasProductRecommendations = computed(() => relatedCases.value.length > 0 || relatedIndustrySolutions.value.length > 0)

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
  document.title = title ? `${title} - 武汉云台数据` : '产品详情 - 武汉云台数据'
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', description || '')
}

onMounted(loadProduct)
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
