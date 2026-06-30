<template>
  <SiteHeader />
  <main>
    <section id="home" class="hero grid-bg" :style="heroBackgroundStyle">
      <div class="container hero-inner">
        <div class="hero-copy">
          <div class="pill hero-pill"><Award :size="14" />国家高新技术企业 · 湖北省人工智能企业</div>
          <h1 class="hero-title">
            <span>{{ hero.title }}</span>
          </h1>
          <p>{{ hero.subtitle }}</p>
          <div class="actions">
            <a class="primary hero-button" href="#cases"><span>了解解决方案</span><ArrowRight :size="16" /></a>
            <a class="ghost hero-button" href="#contact"><CalendarDays :size="16" /><span>预约交流</span></a>
          </div>
          <div class="stats">
            <div v-for="metric in metrics" :key="`${metric.value}-${metric.description}`" class="stat-item">
              <div class="stat-value"><strong>{{ metric.value }}</strong><span v-if="metric.unit">{{ metric.unit }}</span></div>
              <p>{{ metric.description }}</p>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="orbit">
            <div class="visual-chip c1"><span class="chip-icon good"><Check :size="19" /></span><b>智能决策</b><small>AI驱动</small></div>
            <div class="visual-chip c2"><span class="chip-icon data"><BarChart3 :size="19" /></span><b>数据融合</b><small>实时分析</small></div>
            <div class="core"><span>云</span><small>DATA</small></div>
            <i><Building2 :size="20" /></i>
            <i><Landmark :size="20" /></i>
            <i><Zap :size="20" /></i>
            <i><ClipboardList :size="20" /></i>
          </div>
        </div>
      </div>
    </section>

    <section id="ai" class="dark-section">
      <div class="container">
        <span class="dark-pill">AI战略</span>
        <h2>从数字化到智能化</h2>
        <p class="lead">云台数据正在从系统建设走向智能协同。十余年的行业经验、业务系统和数据资产积累，让AI具备真实落地的基础。</p>
        <div class="ai-cards">
          <Feature v-for="(card, index) in aiCards" :key="card.id" :icon="aiCardIcon(card, index)" :color="aiCardColor(index)" :en="card.en" :title="card.title" :text="card.text" />
        </div>
        <div class="center ai-cta"><a class="primary" href="#contact">探索AI智能体解决方案</a></div>
      </div>
    </section>

    <section id="products" class="section">
      <div class="container">
        <SectionTitle tag="产品体系" title="从能力底座到产品矩阵" desc="三层架构覆盖企业数字化全链路，五大产品让每一层能力都可落地" />
        <h3 class="base-title">能力底座</h3>
        <div class="base-cards">
          <div v-for="(capability, index) in capabilities" :key="capability.id" :class="['base-card', capabilityClass(index)]"><h4>{{ capability.name }}</h4><p>{{ capabilityDescription(index) }}</p><span v-for="item in capabilityItems(capability)" :key="item.id">{{ item.name }}</span></div>
        </div>
        <h3>产品矩阵</h3>
        <div class="product-grid">
          <router-link v-for="(p, index) in products" :key="p.id" class="product-card" :class="{ soon: p.id === 'agent' }" :to="productTarget(p)">
            <span class="status">{{ p.status }}</span>
            <IconBox :name="productIcon(p, index)" :color="productColor(p, index)" />
            <h4>{{ p.title }}</h4>
            <b>{{ p.sub }}</b>
            <p>{{ p.desc }}</p>
            <em>了解详情 →</em>
          </router-link>
        </div>
      </div>
    </section>

    <section id="innovation" class="dark-section innovation-section">
      <div class="container innovation-inner">
        <div class="innovation-hero">
          <span>创新研发体系</span>
          <h2>技术创新与行业应用并重</h2>
          <p>持续推动前沿技术与产业场景深度融合</p>
        </div>
        <h3 class="innovation-heading"><GraduationCap :size="34" />产学研合作</h3>
        <div class="school-row innovation-schools">
          <div v-for="school in partnerUniversities" :key="school.name">
            <img v-if="school.logoUrl && !failedUniversityLogos[school.name]" :src="school.logoUrl" :alt="school.fullName || school.name" @error="failedUniversityLogos[school.name] = true">
            <span v-else>{{ school.name }}</span>
            <b v-if="school.fullName">{{ school.fullName }}</b>
          </div>
        </div>
        <p class="innovation-note">围绕人工智能、数据治理、行业数字化与智能体应用开展联合研究与成果转化</p>
        <h3 class="innovation-subtitle">重点研发方向</h3>
        <div class="research-grid">
          <div v-for="(direction, index) in researchDirections" :key="direction.title" class="research-card"><span class="research-icon"><img v-if="direction.iconUrl && !failedResearchIcons[direction.title]" :src="direction.iconUrl" :alt="direction.title" @error="failedResearchIcons[direction.title] = true"><component v-else :is="researchDirectionIcon(index)" :size="34" /></span><small v-if="direction.en">{{ direction.en }}</small><h4>{{ direction.title }}</h4><p>{{ direction.summary }}</p></div>
        </div>
      </div>
    </section>

    <section id="cases" class="section soft">
      <div class="container">
        <SectionTitle tag="产品与行业方案" title="聚焦典型行业场景" desc="推动数字化与智能化价值落地" />
        <div class="case-grid">
          <router-link v-for="(solution, index) in industrySolutions" :key="solution.name" to="/case" class="case-card">
            <IconBox :name="industrySolutionIcon(solution, index)" :color="industrySolutionColor(index)" />
            <span class="arrow">→</span>
            <h3>{{ solution.name }}</h3>
            <p>{{ solution.description }}</p>
            <div class="customer"><b>典型客户</b><small>{{ customerTagsText(solution) }}</small></div>
          </router-link>
        </div>
      </div>
    </section>

    <section id="about" class="section soft timeline-section">
      <div class="container">
        <SectionTitle tag="关于我们" title="十余年深耕，持续成长" />
        <div class="timeline">
          <div v-for="(t, i) in timeline" :key="t[0]" :class="['tl-item', i % 2 ? 'right' : 'left', t[0] === '2026' ? 'current' : '']">
            <b>{{ t[0] }}</b><h4>{{ t[1] }}</h4><p>{{ t[2] }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="strength" class="section strength-section">
      <div class="container strength-inner">
        <div class="strength-title">
          <span>关于我们</span>
          <h2>十余年的行业积累，是云台数据持续创新的基础</h2>
        </div>
        <div class="strength">
          <div class="strength-panel honors-panel">
            <h3><span class="panel-icon"><Award :size="26" /></span>资质与荣誉</h3>
            <div class="honor-grid">
              <p v-for="honor in honors" :key="honor.name">
                <img v-if="honor.iconUrl" class="honor-icon" :src="honor.iconUrl" :alt="honor.name" />
                <Trophy v-else :size="20" />
                {{ honor.name }}
              </p>
            </div>
          </div>
          <div class="strength-panel clients-panel">
            <h3><span class="panel-icon"><Building2 :size="26" /></span>服务客户</h3>
            <div class="client-grid">
              <span v-for="(client, index) in clientLogos" :key="client.id"><img v-if="client.logoUrl && !failedClientLogos[client.id]" :src="client.logoUrl" :alt="client.name" @error="failedClientLogos[client.id] = true"><i v-else>{{ clientLogoFallback(index) }}</i>{{ client.name }}<small v-if="client.industry">{{ client.industry }}</small></span>
            </div>
          </div>
        </div>
        <div class="nums">
          <b v-for="(metric, index) in strengthMetrics" :key="metric.id"><span class="num-icon"><component :is="strengthMetricIcon(index)" :size="28" /></span>{{ metric.value }}<small>{{ metric.label }}</small></b>
        </div>
      </div>
    </section>

    <section id="values" class="section values-section">
      <div class="container">
        <SectionTitle tag="关于我们" title="核心价值观" />
        <div class="values">
          <div v-for="(card, index) in valueCards" :key="card.title"><img v-if="card.iconUrl && !failedValueIcons[card.title]" :src="card.iconUrl" :alt="card.title" @error="failedValueIcons[card.title] = true"><IconBox v-else :name="valueCardIcon(index)" /><h3>{{ card.title }}</h3><b v-if="card.subtitle">{{ card.subtitle }}</b><p>{{ card.description }}</p></div>
        </div>
        <div class="promise"><h3>我们的承诺</h3><p v-if="ourPromises.content">{{ ourPromises.content }}</p><span v-for="tag in promiseTags" :key="tag.label">{{ tag.label }}</span></div>
      </div>
    </section>

    <section id="contact" class="section soft">
      <div class="container">
        <SectionTitle tag="联系我们" title="期待与您共同探索未来" desc="无论您正在规划数字化转型、建设数据平台，还是探索人工智能应用落地" />
        <div class="contact-grid">
          <div>
            <div class="contact-card"><h3>联系方式</h3><p v-if="contactInfo.address"><b>地址</b><br>{{ contactInfo.address }}</p><p v-if="contactInfo.phone"><b>商务咨询</b><br>{{ contactInfo.phone }}</p><p v-if="contactInfo.email"><b>邮箱联系</b><br>{{ contactInfo.email }}</p></div>
            <div class="blue-box"><h3>合作方向</h3><span v-for="tag in cooperationDirectionTags" :key="tag.label">{{ tag.label }}</span></div>
          </div>
          <form class="form" @submit.prevent="handleLeadSubmit">
            <h3>预约交流</h3>
            <div class="form-row"><label>姓名 *<input v-model="leadForm.contactName" placeholder="您的姓名" /></label><label>公司 *<input v-model="leadForm.companyName" placeholder="公司名称" /></label></div>
            <div class="form-row"><label>邮箱 *<input v-model="leadForm.email" placeholder="your@email.com" /></label><label>电话<input v-model="leadForm.phone" placeholder="联系电话" /></label></div>
            <label>需求描述<textarea v-model="leadForm.demandContent" placeholder="请简要描述您的需求..."></textarea></label>
            <button type="submit" class="primary full" :disabled="submitting">{{ submitting ? '提交中...' : '提交预约' }}</button>
            <p v-if="leadMessage">{{ leadMessage }}</p>
          </form>
        </div>
      </div>
    </section>
  </main>
  <FooterSection />
</template>

<script setup lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import FooterSection from '../components/FooterSection.vue'
import SectionTitle from '../components/SectionTitle.vue'
import IconBox from '../components/IconBox.vue'
import Feature from '../components/Feature.vue'
import {
  products as defaultProducts,
  timeline as defaultTimeline,
  hero as defaultHero,
  metrics as defaultMetrics,
  honors as defaultHonors,
  industrySolutions as defaultIndustrySolutions,
  contactInfo as defaultContactInfo,
  cooperationDirectionTags as defaultCooperationDirectionTags,
  aiCards as defaultAiCards,
  capabilities as defaultCapabilities,
  clientLogos as defaultClientLogos,
  strengthMetrics as defaultStrengthMetrics,
  partnerUniversities as defaultPartnerUniversities,
  timelineEvents as defaultTimelineEvents,
  researchDirections as defaultResearchDirections,
  valueCards as defaultValueCards,
  ourPromises as defaultOurPromises,
} from '../data/site'
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Award, BarChart3, Bot, BrainCircuit, Building2, CalendarDays, Check, ClipboardList, BookOpen, GraduationCap, Landmark, Lightbulb, Trophy, Users, Zap } from 'lucide-vue-next'
import {
  getHomeBanner,
  getHomeMetrics,
  getHonors,
  getPortalAiCards,
  getPortalCapabilities,
  getPortalClientLogos,
  getPortalContactInfo,
  getPortalCooperationDirectionTags,
  getPortalIndustrySolutions,
  getPortalOurPromises,
  getPortalPartnerUniversities,
  getPortalProducts,
  getPortalResearchDirections,
  getPortalStrengthMetrics,
  getPortalTimelineEvents,
  getPortalValueCards,
  submitPortalLead,
} from '../api/portal'

const hero = ref({ ...defaultHero })
const metrics = ref([...defaultMetrics])
const honors = ref([...defaultHonors])
const products = ref<any[]>([...defaultProducts])
const industrySolutions = ref<any[]>([...defaultIndustrySolutions])
const contactInfo = ref({ ...defaultContactInfo })
const cooperationDirectionTags = ref<any[]>([...defaultCooperationDirectionTags])
const aiCards = ref<any[]>([...defaultAiCards])
const capabilities = ref<any[]>([...defaultCapabilities])
const clientLogos = ref<any[]>([...defaultClientLogos])
const strengthMetrics = ref<any[]>([...defaultStrengthMetrics])
const partnerUniversities = ref<any[]>([...defaultPartnerUniversities])
const timeline = ref<any[]>(defaultTimeline.map((item) => [...item]))
const researchDirections = ref<any[]>([...defaultResearchDirections])
const valueCards = ref<any[]>([...defaultValueCards])
const ourPromises = ref({
  content: defaultOurPromises.content,
  tags: [...defaultOurPromises.tags],
})
const failedClientLogos = ref<Record<string, boolean>>({})
const failedUniversityLogos = ref<Record<string, boolean>>({})
const failedResearchIcons = ref<Record<string, boolean>>({})
const failedValueIcons = ref<Record<string, boolean>>({})
const submitting = ref(false)
const leadMessage = ref('')
const leadForm = ref({
  contactName: '',
  companyName: '',
  email: '',
  phone: '',
  demandContent: '',
})

const productDisplayMeta = defaultProducts.map((product) => ({
  id: product.id,
  icon: product.icon,
  color: product.color,
}))
const fallbackIndustryIcons = ['Factory', 'Zap', 'Building2', 'Database']
const fallbackIndustryColors = ['orange', 'cyan', 'blue', 'green']
const fallbackAiIcons = ['BookOpen', 'MessageSquare', 'ChartNoAxesColumn', 'Bot']
const fallbackAiColors = ['orange', 'cyan', 'green', 'purple']
const capabilityClasses = ['management', 'data', 'ai']
const capabilityDescriptions = [
  '帮助大型组织实现集团化、标准化与精细化运营',
  '打通多源数据与业务流程，构建统一的数据资产体系',
  '推动AI进入真实业务场景',
]
const clientLogoFallbacks = ['🏗', '⚡', '📊', '🌉', '🏭']
const strengthMetricIcons = [Users, Building2, Award, Trophy]
const researchDirectionIcons = [BrainCircuit, BookOpen, Bot, Lightbulb]
const valueCardIcons = ['Users', 'Handshake', 'Heart']

const heroBackgroundStyle = computed(() => {
  if (!hero.value.backgroundImage) return {}

  return {
    backgroundImage: `linear-gradient(rgba(255, 255, 255, .86), rgba(255, 255, 255, .86)), url(${hero.value.backgroundImage})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  }
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function asText(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = asText(value)
    if (text) return text
  }

  return ''
}

function fillToDefaultCount<T>(items: T[], defaults: T[]) {
  const maxCount = defaults.length
  const limited = items.slice(0, maxCount)

  if (limited.length >= maxCount) return limited

  return [...limited, ...defaults.slice(limited.length)]
}

function mapHomeBanner(data: unknown) {
  const source = Array.isArray(data) ? data[0] : data
  if (!isRecord(source)) return null

  return {
    title: firstText(source.mainTitle, source.title, source.name) || defaultHero.title,
    subtitle: firstText(source.subTitle, source.subtitle, source.description) || defaultHero.subtitle,
    backgroundImage: firstText(source.backgroundImageUrl, source.imageUrl, source.backgroundImage) || defaultHero.backgroundImage,
  }
}

function mapMetrics(data: unknown) {
  if (!Array.isArray(data) || data.length === 0) return null

  const mapped = data
    .filter(isRecord)
    .map((item) => ({
      value: asText(item.value),
      unit: asText(item.unit),
      description: firstText(item.description, item.label, item.title, item.name),
    }))
    .filter((item) => item.value && item.description)

  return mapped.length ? fillToDefaultCount(mapped, defaultMetrics) : null
}

function mapHonors(data: unknown) {
  if (!Array.isArray(data) || data.length === 0) return null

  const mapped = data
    .filter(isRecord)
    .map((item) => ({
      name: firstText(item.name, item.title, item.label),
      iconUrl: firstText(item.iconUrl, item.imageUrl, item.logoUrl),
    }))
    .filter((item) => item.name)

  return mapped.length ? fillToDefaultCount(mapped, defaultHonors) : null
}

function findProductMeta(product: { id?: unknown }, index: number) {
  return productDisplayMeta.find((item) => item.id === product.id) || productDisplayMeta[index] || productDisplayMeta[0]
}

function productIcon(product: { id?: unknown }, index: number) {
  return findProductMeta(product, index)?.icon || 'Box'
}

function productColor(product: { id?: unknown }, index: number) {
  return findProductMeta(product, index)?.color || 'blue'
}

function productTarget(product: { detailLink?: unknown }) {
  return firstText(product.detailLink) || '/product'
}

function industrySolutionIcon(solution: { iconUrl?: unknown }, index: number) {
  const iconUrl = firstText(solution.iconUrl)

  return iconUrl && !iconUrl.includes('/') ? iconUrl : fallbackIndustryIcons[index % fallbackIndustryIcons.length]
}

function industrySolutionColor(index: number) {
  return fallbackIndustryColors[index % fallbackIndustryColors.length]
}

function customerTagsText(solution: { customerTags?: unknown }) {
  return Array.isArray(solution.customerTags) && solution.customerTags.length
    ? solution.customerTags.map(asText).filter(Boolean).join(' / ')
    : ''
}

function aiCardIcon(card: { iconUrl?: unknown }, index: number) {
  const iconUrl = firstText(card.iconUrl)

  return iconUrl && !iconUrl.includes('/') ? iconUrl : fallbackAiIcons[index % fallbackAiIcons.length]
}

function aiCardColor(index: number) {
  return fallbackAiColors[index % fallbackAiColors.length]
}

function capabilityClass(index: number) {
  return capabilityClasses[index % capabilityClasses.length]
}

function capabilityDescription(index: number) {
  return capabilityDescriptions[index % capabilityDescriptions.length]
}

function capabilityItems(capability: { items?: unknown }) {
  return Array.isArray(capability.items) ? capability.items : []
}

function clientLogoFallback(index: number) {
  return clientLogoFallbacks[index % clientLogoFallbacks.length]
}

function strengthMetricIcon(index: number) {
  return strengthMetricIcons[index % strengthMetricIcons.length]
}

function researchDirectionIcon(index: number) {
  return researchDirectionIcons[index % researchDirectionIcons.length]
}

function valueCardIcon(index: number) {
  return valueCardIcons[index % valueCardIcons.length]
}

function mapTimelineRows(data: unknown) {
  if (!Array.isArray(data)) return []

  return data.map((item) => {
    if (Array.isArray(item)) return [asText(item[0]), asText(item[1]), asText(item[2])]
    if (!isRecord(item)) return ['', '', '']

    return [asText(item.year), asText(item.title), asText(item.description)]
  })
}

function normalizePromiseTags(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .filter(isRecord)
    .map((tag) => {
      const label = firstText(tag.label, tag.tagText)

      return {
        tagText: label,
        label,
      }
    })
    .filter((tag) => tag.label)
}

const promiseTags = computed(() => normalizePromiseTags(ourPromises.value.tags))

function resetLeadForm() {
  leadForm.value = {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    demandContent: '',
  }
}

function validateLeadForm() {
  const form = leadForm.value
  const contactName = form.contactName.trim()
  const companyName = form.companyName.trim()
  const email = form.email.trim()
  const phone = form.phone.trim()
  const demandContent = form.demandContent.trim()

  if (!contactName) return '请填写姓名'
  if (contactName.length > 64) return '姓名不能超过64个字符'
  if (!companyName) return '请填写公司名称'
  if (companyName.length > 128) return '公司名称不能超过128个字符'
  if (!email) return '请填写邮箱'
  if (email.length > 128) return '邮箱不能超过128个字符'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请填写正确的邮箱'
  if (phone && phone.length > 64) return '联系电话不能超过64个字符'
  if (phone && !/^[0-9+\-()\s]+$/.test(phone)) return '联系电话格式不正确'
  if (demandContent && demandContent.length > 1000) return '需求描述不能超过1000个字符'

  return ''
}

async function loadHomeBanner() {
  try {
    const data = await getHomeBanner()
    const mapped = mapHomeBanner(data)
    if (mapped) hero.value = mapped
  } catch (error) {
    console.error('[Portal API] home-banner failed, fallback to site.js', error)
  }
}

async function loadHomeMetrics() {
  try {
    const data = await getHomeMetrics()
    const mapped = mapMetrics(data)
    if (mapped) metrics.value = mapped
  } catch (error) {
    console.error('[Portal API] home-metrics failed, fallback to site.js', error)
  }
}

async function loadHonors() {
  try {
    const data = await getHonors()
    const mapped = mapHonors(data)
    if (mapped) honors.value = mapped
  } catch (error) {
    console.error('[Portal API] honors failed, fallback to site.js', error)
  }
}

async function loadProducts() {
  try {
    const data = await getPortalProducts()
    if (Array.isArray(data)) products.value = data
  } catch (error) {
    console.error('[Portal API] products failed, fallback to site.js', error)
    products.value = [...defaultProducts]
  }
}

async function loadIndustrySolutions() {
  try {
    const data = await getPortalIndustrySolutions()
    if (Array.isArray(data)) industrySolutions.value = data
  } catch (error) {
    console.error('[Portal API] industry-solutions failed, fallback to site.js', error)
    industrySolutions.value = [...defaultIndustrySolutions]
  }
}

async function loadContactInfo() {
  try {
    contactInfo.value = await getPortalContactInfo()
  } catch (error) {
    console.error('[Portal API] contact-info failed, fallback to site.js', error)
    contactInfo.value = { ...defaultContactInfo }
  }
}

async function loadCooperationDirectionTags() {
  try {
    const data = await getPortalCooperationDirectionTags()
    if (Array.isArray(data)) cooperationDirectionTags.value = data
  } catch (error) {
    console.error('[Portal API] cooperation-direction-tags failed, fallback to site.js', error)
    cooperationDirectionTags.value = [...defaultCooperationDirectionTags]
  }
}

async function loadAiCards() {
  try {
    const data = await getPortalAiCards()
    if (Array.isArray(data)) aiCards.value = data
  } catch (error) {
    console.error('[Portal API] ai-cards failed, fallback to site.js', error)
    aiCards.value = [...defaultAiCards]
  }
}

async function loadCapabilities() {
  try {
    const data = await getPortalCapabilities()
    if (Array.isArray(data)) capabilities.value = data
  } catch (error) {
    console.error('[Portal API] capabilities failed, fallback to site.js', error)
    capabilities.value = [...defaultCapabilities]
  }
}

async function loadClientLogos() {
  try {
    const data = await getPortalClientLogos()
    if (Array.isArray(data)) clientLogos.value = data
  } catch (error) {
    console.error('[Portal API] client-logos failed, fallback to site.js', error)
    clientLogos.value = [...defaultClientLogos]
  }
}

async function loadStrengthMetrics() {
  try {
    const data = await getPortalStrengthMetrics()
    if (Array.isArray(data)) strengthMetrics.value = data
  } catch (error) {
    console.error('[Portal API] strength-metrics failed, fallback to site.js', error)
    strengthMetrics.value = [...defaultStrengthMetrics]
  }
}

async function loadPartnerUniversities() {
  try {
    const data = await getPortalPartnerUniversities()
    if (Array.isArray(data)) partnerUniversities.value = data
  } catch (error) {
    console.error('[Portal API] partner-universities failed, fallback to site.js', error)
    partnerUniversities.value = [...defaultPartnerUniversities]
  }
}

async function loadTimelineEvents() {
  try {
    const data = await getPortalTimelineEvents()
    if (Array.isArray(data)) timeline.value = mapTimelineRows(data)
  } catch (error) {
    console.error('[Portal API] timeline-events failed, fallback to site.js', error)
    timeline.value = mapTimelineRows(defaultTimelineEvents)
  }
}

async function loadResearchDirections() {
  try {
    const data = await getPortalResearchDirections()
    if (Array.isArray(data)) researchDirections.value = data
  } catch (error) {
    console.error('[Portal API] research-directions failed, fallback to site.js', error)
    researchDirections.value = [...defaultResearchDirections]
  }
}

async function loadValueCards() {
  try {
    const data = await getPortalValueCards()
    if (Array.isArray(data)) valueCards.value = data
  } catch (error) {
    console.error('[Portal API] value-cards failed, fallback to site.js', error)
    valueCards.value = [...defaultValueCards]
  }
}

async function loadOurPromises() {
  try {
    const data = await getPortalOurPromises()
    if (isRecord(data)) {
      ourPromises.value = {
        content: asText(data.content),
        tags: normalizePromiseTags(data.tags),
      }
    }
  } catch (error) {
    console.error('[Portal API] our-promises failed, fallback to site.js', error)
    ourPromises.value = {
      content: defaultOurPromises.content,
      tags: [...defaultOurPromises.tags],
    }
  }
}

async function handleLeadSubmit() {
  if (submitting.value) return

  const validationMessage = validateLeadForm()
  if (validationMessage) {
    leadMessage.value = validationMessage
    return
  }

  submitting.value = true
  leadMessage.value = ''

  try {
    await submitPortalLead(leadForm.value)
    leadMessage.value = '提交成功，我们会尽快与您联系'
    resetLeadForm()
  } catch (error) {
    console.error('[Portal API] leads failed', error)
    leadMessage.value = '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadHomeBanner()
  loadHomeMetrics()
  loadHonors()
  loadProducts()
  loadIndustrySolutions()
  loadContactInfo()
  loadCooperationDirectionTags()
  loadAiCards()
  loadCapabilities()
  loadClientLogos()
  loadStrengthMetrics()
  loadPartnerUniversities()
  loadTimelineEvents()
  loadResearchDirections()
  loadValueCards()
  loadOurPromises()
})</script>
