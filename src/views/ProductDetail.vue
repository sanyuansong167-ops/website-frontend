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

        <article v-else-if="product" class="detail-card product-detail-card">
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

@media (max-width: 760px) {
  .product-detail-card {
    grid-template-columns: 1fr;
  }
}
</style>
