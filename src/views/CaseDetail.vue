<template>
  <SiteHeader />
  <main class="detail-page soft">
    <section class="section">
      <div class="container">
        <SectionTitle
          tag="案例详情"
          title="案例详情"
          desc="聚焦运行在企业真实场景、每一个案例均不是演示内容，而是正在服务中的客户案例。"
        />
        <div class="case-list">
          <article v-for="(c, index) in cases" :key="c.title" class="case-detail">
            <img :src="caseImage(c, index)" :alt="c.title">
            <div>
              <h2>{{ c.title }}</h2>
              <b>{{ caseTagSummary(c) }}</b>
              <p>{{ c.desc }}</p>
              <span v-for="t in caseTags(c)" :key="t">{{ t }}</span>
              <blockquote>{{ c.desc }}</blockquote>
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
import { cases as defaultCases } from '../data/site'
import { getPortalCases } from '../api/portal'
import SiteHeader from '../components/SiteHeader.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionTitle from '../components/SectionTitle.vue'

const cases = ref([...defaultCases])

function caseImage(item, index) {
  return item.img || defaultCases[index]?.img || ''
}

function caseTags(item) {
  return Array.isArray(item.tags) ? item.tags : []
}

function caseTagSummary(item) {
  return caseTags(item).join(' / ')
}

async function loadCases() {
  try {
    const data = await getPortalCases()
    if (Array.isArray(data) && data.length > 0) cases.value = data
  } catch (error) {
    console.error('[Portal API] cases failed, fallback to site.js', error)
    cases.value = [...defaultCases]
  }
}

onMounted(loadCases)
</script>
