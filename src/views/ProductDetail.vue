<template>
  <SiteHeader />
  <main class="detail-page">
    <section class="section">
      <div class="container">
        <SectionTitle
          tag="产品详情"
          title="产品详情"
          desc="真实贴合行业业务场景，每一个模块均不是演示内容，而是云台进行中的生产产品。"
        />
        <div class="detail-list">
          <article v-for="(p, index) in products" :key="p.id" class="detail-card">
            <div>
              <IconBox :name="productIcon(p, index)" :color="productColor(p, index)" />
              <h2>{{ p.title }}</h2>
              <b>{{ p.sub }}</b>
              <p>{{ p.desc }}</p>
              <span v-for="t in productTags(p, index)" :key="t">{{ t }}</span>
            </div>
            <div>
              <h3>核心功能</h3>
              <ul>
                <li v-for="f in productFeatures(p, index)" :key="f">{{ f }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
  <FooterSection />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { products as defaultProducts } from '../data/site'
import { getPortalProducts } from '../api/portal'
import SiteHeader from '../components/SiteHeader.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionTitle from '../components/SectionTitle.vue'
import IconBox from '../components/IconBox.vue'

const products = ref([...defaultProducts])

function findProductMeta(product, index) {
  return defaultProducts.find((item) => item.id === product.id) || defaultProducts[index] || defaultProducts[0] || {}
}

function productIcon(product, index) {
  return findProductMeta(product, index).icon || 'Box'
}

function productColor(product, index) {
  return findProductMeta(product, index).color || 'blue'
}

function productTags(product, index) {
  return findProductMeta(product, index).tags || []
}

function productFeatures(product, index) {
  return findProductMeta(product, index).features || []
}

async function loadProducts() {
  try {
    const data = await getPortalProducts()
    if (Array.isArray(data) && data.length > 0) products.value = data
  } catch (error) {
    console.error('[Portal API] products failed, fallback to site.js', error)
    products.value = [...defaultProducts]
  }
}

onMounted(loadProducts)
</script>
