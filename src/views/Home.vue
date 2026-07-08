<template>
  <SiteHeader />
  <main>
    <section v-if="showSection('hero')" id="home" class="hero grid-bg" :style="heroBackgroundStyle">
      <div class="container hero-inner">
        <div class="hero-copy">
          <div class="pill hero-pill"><Award :size="14" />{{ heroContent.pill }}</div>
          <h1 class="hero-title">
            <span>{{ hero.title }}</span>
          </h1>
          <p>{{ hero.subtitle }}</p>
          <div v-if="showSection('cta')" class="actions">
            <a class="primary hero-button" :href="ctaContent.primaryHref"><span>{{ ctaContent.primaryText }}</span><ArrowRight :size="16" /></a>
            <a class="ghost hero-button" :href="ctaContent.secondaryHref"><CalendarDays :size="16" /><span>{{ ctaContent.secondaryText }}</span></a>
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

    <section v-if="showSection('ai-capability')" id="ai" class="dark-section">
      <div class="container">
        <span class="dark-pill">{{ aiSectionContent.tag }}</span>
        <h2>{{ aiSectionContent.title }}</h2>
        <p class="lead">{{ aiSectionContent.description }}</p>
        <div class="ai-cards">
          <Feature v-for="(card, index) in aiCards" :key="card.id" :icon="aiCardIcon(card, index)" :color="aiCardColor(index)" :en="card.en" :title="card.title" :text="card.text" />
        </div>
        <div v-if="showSection('cta')" class="center ai-cta"><a class="primary" :href="ctaContent.aiHref">{{ ctaContent.aiText }}</a></div>
      </div>
    </section>

    <section v-if="showSection('products')" id="products" class="section product-system">
      <div class="container product-system-inner">
        <SectionTitle :tag="productsSectionContent.tag" :title="productsSectionContent.title" :desc="productsSectionContent.description" />
        <h3 class="base-title">{{ productsSectionContent.baseTitle }}</h3>
        <div class="base-cards">
          <div v-for="(capability, index) in capabilities" :key="capability.id" :class="['base-card', capabilityClass(index)]">
            <h4>{{ capability.name }}</h4>
            <p>{{ capabilityDescription(index) }}</p>
            <span v-for="item in capabilityItems(capability)" :key="item.id">{{ item.name }}</span>
          </div>
        </div>
        <h3 class="product-matrix-title">{{ productsSectionContent.matrixTitle }}</h3>
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

    <section v-if="showSection('innovation')" id="innovation" class="dark-section innovation-section">
      <div class="container innovation-inner">
        <div class="innovation-hero">
          <span>{{ innovationSectionContent.tag }}</span>
          <h2>{{ innovationSectionContent.title }}</h2>
          <p>{{ innovationSectionContent.description }}</p>
        </div>
        <h3 class="innovation-heading"><GraduationCap :size="34" />{{ innovationSectionContent.cooperationTitle }}</h3>
        <div class="school-row innovation-schools">
          <div v-for="school in partnerUniversities" :key="school.name">
            <img v-if="school.logoUrl && !failedUniversityLogos[school.name]" :src="school.logoUrl" :alt="school.fullName || school.name" @error="failedUniversityLogos[school.name] = true">
            <span v-else>{{ school.name }}</span>
            <b v-if="school.fullName">{{ school.fullName }}</b>
          </div>
        </div>
        <p class="innovation-note">{{ innovationSectionContent.cooperationDescription }}</p>
        <h3 class="innovation-subtitle">{{ innovationSectionContent.researchTitle }}</h3>
        <div class="research-grid">
          <div v-for="(direction, index) in researchDirections" :key="direction.title" class="research-card"><span class="research-icon"><img v-if="direction.iconUrl && !failedResearchIcons[direction.title]" :src="direction.iconUrl" :alt="direction.title" @error="failedResearchIcons[direction.title] = true"><component v-else :is="researchDirectionIcon(index)" :size="34" /></span><small v-if="direction.en">{{ direction.en }}</small><h4>{{ direction.title }}</h4><p>{{ direction.summary }}</p></div>
        </div>
      </div>
    </section>

    <section v-if="showSection('cases')" id="cases" class="section soft industry-section">
      <div class="container industry-inner">
        <SectionTitle :tag="casesSectionContent.tag" :title="casesSectionContent.title" :desc="casesSectionContent.description" />
        <div class="case-grid">
          <router-link v-for="(solution, index) in industrySolutions" :key="solution.name" to="/case" class="case-card industry-card" :class="industrySolutionClass(index)">
            <IconBox :name="industrySolutionIcon(solution, index)" :color="industrySolutionColor(index)" />
            <span class="arrow">↗</span>
            <h3>{{ solution.name }}</h3>
            <p>{{ solution.description }}</p>
            <div class="customer">
              <div class="customer-head"><b>{{ casesSectionContent.customerTitle }}</b><span>{{ casesSectionContent.customerSubtitle }}</span></div>
              <div class="customer-tags">
                <small v-for="tag in customerTags(solution)" :key="tag">{{ tag }}</small>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <section v-if="showSection('about')" id="about" class="section soft timeline-section">
      <div class="container">
        <SectionTitle :tag="aboutSectionContent.tag" :title="aboutSectionContent.title" :desc="aboutSectionContent.description" />
        <div class="timeline">
          <div v-for="(t, i) in timeline" :key="t[0]" :class="['tl-item', i % 2 ? 'right' : 'left', t[0] === '2026' ? 'current' : '']">
            <b>{{ t[0] }}</b><h4>{{ t[1] }}</h4><p>{{ t[2] }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="showSection('about')" id="strength" class="section strength-section">
      <div class="container strength-inner">
        <div class="strength-title">
          <span>{{ aboutSectionContent.tag }}</span>
          <h2>{{ aboutSectionContent.strengthTitle }}</h2>
        </div>
        <div class="strength">
          <div class="strength-panel honors-panel">
            <h3><span class="panel-icon"><Award :size="26" /></span>资质与荣誉</h3>
            <div class="honor-grid">
              <p v-for="honor in honors" :key="honor.name">
                <Trophy :size="20" />
                {{ honor.name }}
              </p>
            </div>
          </div>
          <div class="strength-panel clients-panel">
            <h3><span class="panel-icon"><Building2 :size="26" /></span>服务客户</h3>
            <div class="client-grid">
              <span v-for="(client, index) in clientLogos" :key="client.id">
                <img v-if="client.logoUrl && !failedClientLogos[client.id]" :src="client.logoUrl" :alt="client.name" @error="failedClientLogos[client.id] = true">
                <component v-else :is="clientLogoFallback(index)" class="client-logo-icon" :size="30" />
                {{ client.name }}
                <small v-if="client.industry">{{ client.industry }}</small>
              </span>
            </div>
          </div>
        </div>
        <div class="nums">
          <b v-for="(metric, index) in strengthMetrics" :key="metric.id"><span class="num-icon"><component :is="strengthMetricIcon(index)" :size="28" /></span>{{ metric.value }}<small>{{ metric.label }}</small></b>
        </div>
      </div>
    </section>

    <section v-if="showSection('about')" id="values" class="section values-section">
      <div class="container">
        <SectionTitle :tag="aboutSectionContent.tag" :title="aboutSectionContent.valuesTitle" />
        <div class="values">
          <div v-for="(card, index) in valueCards" :key="card.title"><img v-if="card.iconUrl && !failedValueIcons[card.title]" :src="card.iconUrl" :alt="card.title" @error="failedValueIcons[card.title] = true"><IconBox v-else :name="valueCardIcon(index)" /><h3>{{ card.title }}</h3><b v-if="card.subtitle">{{ card.subtitle }}</b><p>{{ card.description }}</p></div>
        </div>
        <div class="promise"><h3>{{ aboutSectionContent.promiseTitle }}</h3><p v-if="ourPromises.content">{{ ourPromises.content }}</p><span v-for="tag in promiseTags" :key="tag.label">{{ tag.label }}</span></div>
      </div>
    </section>

    <section v-if="showSection('contact')" id="contact" class="section soft">
      <div class="container">
        <SectionTitle :tag="contactSectionContent.tag" :title="contactSectionContent.title" :desc="contactSectionContent.description" />
        <div class="contact-grid">
          <div>
            <div class="contact-card"><h3>{{ contactSectionContent.cardTitle }}</h3><p v-if="contactInfo.address"><b>{{ contactSectionContent.addressLabel }}</b><br>{{ contactInfo.address }}</p><p v-if="contactInfo.phone"><b>{{ contactSectionContent.phoneLabel }}</b><br>{{ contactInfo.phone }}</p><p v-if="contactInfo.email"><b>{{ contactSectionContent.emailLabel }}</b><br>{{ contactInfo.email }}</p></div>
            <div class="blue-box"><h3>{{ contactSectionContent.cooperationTitle }}</h3><span v-for="tag in cooperationDirectionTags" :key="tag.label">{{ tag.label }}</span></div>
          </div>
          <form class="form" @submit.prevent="handleLeadSubmit">
            <h3>{{ ctaContent.formTitle }}</h3>
            <div class="form-row"><label>{{ ctaContent.contactNameLabel }} *<input v-model="leadForm.contactName" :placeholder="ctaContent.contactNamePlaceholder" /></label><label>{{ ctaContent.companyNameLabel }} *<input v-model="leadForm.companyName" :placeholder="ctaContent.companyNamePlaceholder" /></label></div>
            <div class="form-row"><label>{{ ctaContent.emailLabel }} *<input v-model="leadForm.email" :placeholder="ctaContent.emailPlaceholder" /></label><label>{{ ctaContent.phoneLabel }}<input v-model="leadForm.phone" :placeholder="ctaContent.phonePlaceholder" /></label></div>
            <label>{{ ctaContent.demandLabel }}<textarea v-model="leadForm.demandContent" :placeholder="ctaContent.demandPlaceholder"></textarea></label>
            <button type="submit" class="primary full" :disabled="submitting">{{ submitting ? ctaContent.submittingText : ctaContent.submitText }}</button>
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
  getHomeMetrics,
  getHonors,
  getPortalAiCards,
  getPortalCapabilities,
  getPortalClientLogos,
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
import { getPortalPageSections, homePageSectionFallbacks, type PortalPageSection } from '../api/pageSection'

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
const pageSectionsReady = ref(false)
const pageSectionsFailed = ref(false)
const isPageSectionFallback = ref(true)
const isPageSectionPartial = ref(false)
const pageSectionMap = ref<Record<string, PortalPageSection>>({})

const homeSectionCodes = ['hero', 'products', 'ai-capability', 'innovation', 'cases', 'about', 'contact', 'cta']

const productDisplayMeta = defaultProducts.map((product) => ({
  id: product.id,
  icon: product.icon,
  color: product.color,
}))
const fallbackIndustryIcons = ['Factory', 'Zap', 'HeartPulse', 'Landmark']
const fallbackIndustryColors = ['orange', 'cyan', 'green', 'purple']
const industrySolutionClasses = ['materials', 'energy', 'healthcare', 'finance']
const fallbackAiIcons = ['BookOpen', 'MessageSquare', 'ChartNoAxesColumn', 'Bot']
const fallbackAiColors = ['orange', 'cyan', 'green', 'purple']
const capabilityClasses = ['management', 'data', 'ai']
const capabilityDescriptions = [
  '帮助大型组织实现集团化、标准化与精细化运营',
  '打通多源数据与业务流程，构建统一的数据资产体系',
  '推动 AI 进入真实业务场景',
]
const clientLogoFallbackIcons = [Building2, Zap, BarChart3, Landmark, Building2]
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

const heroContent = computed(() => {
  const payload = sectionPayload('hero')

  return {
    pill: firstText(payload.pill, payload.tag, homePageSectionFallbacks.hero.pill),
  }
})

const productsSectionContent = computed(() => {
  const section = pageSectionMap.value.products
  const payload = sectionPayload('products')

  return {
    tag: firstText(payload.tag, homePageSectionFallbacks.products.tag),
    title: firstText(section?.title, payload.title, homePageSectionFallbacks.products.title),
    description: firstText(section?.description, payload.description, homePageSectionFallbacks.products.description),
    baseTitle: firstText(payload.baseTitle, homePageSectionFallbacks.products.baseTitle),
    matrixTitle: firstText(payload.matrixTitle, homePageSectionFallbacks.products.matrixTitle),
    capabilityDescriptions: asTextArray(
      payload.capabilityDescriptions,
      homePageSectionFallbacks.products.capabilityDescriptions,
    ),
  }
})

const aiSectionContent = computed(() => {
  const section = pageSectionMap.value['ai-capability']
  const payload = sectionPayload('ai-capability')

  return {
    tag: firstText(payload.tag, homePageSectionFallbacks.aiCapability.tag),
    title: firstText(section?.title, payload.title, homePageSectionFallbacks.aiCapability.title),
    description: firstText(section?.description, payload.description, homePageSectionFallbacks.aiCapability.description),
  }
})

const innovationSectionContent = computed(() => {
  const section = pageSectionMap.value.innovation
  const payload = sectionPayload('innovation')

  return {
    tag: firstText(payload.tag, homePageSectionFallbacks.innovation.tag),
    title: firstText(section?.title, payload.title, homePageSectionFallbacks.innovation.title),
    description: firstText(section?.description, payload.description, homePageSectionFallbacks.innovation.description),
    cooperationTitle: firstText(payload.cooperationTitle, section?.subtitle, homePageSectionFallbacks.innovation.cooperationTitle),
    cooperationDescription: firstText(payload.cooperationDescription, homePageSectionFallbacks.innovation.cooperationDescription),
    researchTitle: firstText(payload.researchTitle, homePageSectionFallbacks.innovation.researchTitle),
  }
})

const casesSectionContent = computed(() => {
  const section = pageSectionMap.value.cases
  const payload = sectionPayload('cases')

  return {
    tag: firstText(payload.tag, homePageSectionFallbacks.cases.tag),
    title: firstText(section?.title, payload.title, homePageSectionFallbacks.cases.title),
    description: firstText(section?.description, payload.description, homePageSectionFallbacks.cases.description),
    customerTitle: firstText(payload.customerTitle, homePageSectionFallbacks.cases.customerTitle),
    customerSubtitle: firstText(payload.customerSubtitle, homePageSectionFallbacks.cases.customerSubtitle),
  }
})

const aboutSectionContent = computed(() => {
  const section = pageSectionMap.value.about
  const payload = sectionPayload('about')

  return {
    tag: firstText(payload.tag, homePageSectionFallbacks.about.tag),
    title: firstText(section?.title, payload.title, homePageSectionFallbacks.about.title),
    description: firstText(section?.description, payload.description),
    strengthTitle: firstText(payload.strengthTitle, section?.subtitle, homePageSectionFallbacks.about.strengthTitle),
    valuesTitle: firstText(payload.valuesTitle, homePageSectionFallbacks.about.valuesTitle),
    promiseTitle: firstText(payload.promiseTitle, homePageSectionFallbacks.about.promiseTitle),
  }
})

const contactSectionContent = computed(() => {
  const section = pageSectionMap.value.contact
  const payload = sectionPayload('contact')

  return {
    tag: firstText(payload.tag, homePageSectionFallbacks.contact.tag),
    title: firstText(section?.title, payload.title, homePageSectionFallbacks.contact.title),
    description: firstText(section?.description, payload.description, homePageSectionFallbacks.contact.description),
    cardTitle: firstText(payload.cardTitle, homePageSectionFallbacks.contact.cardTitle),
    addressLabel: firstText(payload.addressLabel, homePageSectionFallbacks.contact.addressLabel),
    phoneLabel: firstText(payload.phoneLabel, homePageSectionFallbacks.contact.phoneLabel),
    emailLabel: firstText(payload.emailLabel, homePageSectionFallbacks.contact.emailLabel),
    cooperationTitle: firstText(payload.cooperationTitle, homePageSectionFallbacks.contact.cooperationTitle),
  }
})

const ctaContent = computed(() => {
  const section = pageSectionMap.value.cta
  const payload = sectionPayload('cta')

  return {
    primaryText: firstText(payload.primaryText, section?.title, homePageSectionFallbacks.cta.primaryText),
    primaryHref: firstText(payload.primaryHref, homePageSectionFallbacks.cta.primaryHref),
    secondaryText: firstText(payload.secondaryText, section?.subtitle, homePageSectionFallbacks.cta.secondaryText),
    secondaryHref: firstText(payload.secondaryHref, homePageSectionFallbacks.cta.secondaryHref),
    aiText: firstText(payload.aiText, section?.description, homePageSectionFallbacks.cta.aiText),
    aiHref: firstText(payload.aiHref, homePageSectionFallbacks.cta.aiHref),
    formTitle: firstText(payload.formTitle, section?.subtitle, homePageSectionFallbacks.cta.formTitle),
    contactNameLabel: firstText(payload.contactNameLabel, homePageSectionFallbacks.cta.contactNameLabel),
    contactNamePlaceholder: firstText(payload.contactNamePlaceholder, homePageSectionFallbacks.cta.contactNamePlaceholder),
    companyNameLabel: firstText(payload.companyNameLabel, homePageSectionFallbacks.cta.companyNameLabel),
    companyNamePlaceholder: firstText(payload.companyNamePlaceholder, homePageSectionFallbacks.cta.companyNamePlaceholder),
    emailLabel: firstText(payload.emailLabel, homePageSectionFallbacks.cta.emailLabel),
    emailPlaceholder: firstText(payload.emailPlaceholder, homePageSectionFallbacks.cta.emailPlaceholder),
    phoneLabel: firstText(payload.phoneLabel, homePageSectionFallbacks.cta.phoneLabel),
    phonePlaceholder: firstText(payload.phonePlaceholder, homePageSectionFallbacks.cta.phonePlaceholder),
    demandLabel: firstText(payload.demandLabel, homePageSectionFallbacks.cta.demandLabel),
    demandPlaceholder: firstText(payload.demandPlaceholder, homePageSectionFallbacks.cta.demandPlaceholder),
    submitText: firstText(payload.submitText, homePageSectionFallbacks.cta.submitText),
    submittingText: firstText(payload.submittingText, homePageSectionFallbacks.cta.submittingText),
    successMessage: firstText(payload.successMessage, homePageSectionFallbacks.cta.successMessage),
    failureMessage: firstText(payload.failureMessage, homePageSectionFallbacks.cta.failureMessage),
    contactNameRequiredMessage: firstText(payload.contactNameRequiredMessage, homePageSectionFallbacks.cta.contactNameRequiredMessage),
    contactNameMaxMessage: firstText(payload.contactNameMaxMessage, homePageSectionFallbacks.cta.contactNameMaxMessage),
    companyNameRequiredMessage: firstText(payload.companyNameRequiredMessage, homePageSectionFallbacks.cta.companyNameRequiredMessage),
    companyNameMaxMessage: firstText(payload.companyNameMaxMessage, homePageSectionFallbacks.cta.companyNameMaxMessage),
    emailRequiredMessage: firstText(payload.emailRequiredMessage, homePageSectionFallbacks.cta.emailRequiredMessage),
    emailMaxMessage: firstText(payload.emailMaxMessage, homePageSectionFallbacks.cta.emailMaxMessage),
    emailInvalidMessage: firstText(payload.emailInvalidMessage, homePageSectionFallbacks.cta.emailInvalidMessage),
    phoneMaxMessage: firstText(payload.phoneMaxMessage, homePageSectionFallbacks.cta.phoneMaxMessage),
    phoneInvalidMessage: firstText(payload.phoneInvalidMessage, homePageSectionFallbacks.cta.phoneInvalidMessage),
    demandMaxMessage: firstText(payload.demandMaxMessage, homePageSectionFallbacks.cta.demandMaxMessage),
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

function asTextArray(value: unknown, fallback: unknown[] = []) {
  const source = Array.isArray(value) && value.length ? value : fallback

  return source
    .map((item) => asText(item))
    .filter(Boolean)
}

function fillToDefaultCount<T>(items: T[], defaults: T[]) {
  const maxCount = defaults.length
  const limited = items.slice(0, maxCount)

  if (limited.length >= maxCount) return limited

  return [...limited, ...defaults.slice(limited.length)]
}

function showSection(sectionCode: string) {
  if (!pageSectionsReady.value || pageSectionsFailed.value || isPageSectionFallback.value) return true
  if (isPageSectionPartial.value && !pageSectionMap.value[sectionCode]) return true
  return Boolean(pageSectionMap.value[sectionCode])
}

function parseSectionContent(section?: PortalPageSection) {
  if (!section?.contentJson) return {}

  try {
    const parsed = JSON.parse(section.contentJson)
    return isRecord(parsed) ? parsed : {}
  } catch (error) {
    console.error(`[Portal API] page-section ${section.sectionCode} contentJson invalid`, error)
    return {}
  }
}

function sectionPayload(sectionCode: string) {
  return parseSectionContent(pageSectionMap.value[sectionCode])
}

function mapHeroSection(section?: PortalPageSection) {
  if (!section) return null
  const payload = parseSectionContent(section)

  return {
    title: firstText(section.title, payload.title, payload.mainTitle) || defaultHero.title,
    subtitle: firstText(section.subtitle, payload.subtitle, section.description, payload.description) || defaultHero.subtitle,
    backgroundImage: firstText(
      payload.bannerImageUrl,
      payload.backgroundImageUrl,
      payload.backgroundImage,
      payload.imageUrl,
      payload.mediaUrl,
      payload.publicUrl,
      payload.absoluteUrl,
    ) || defaultHero.backgroundImage,
  }
}

function mapContactSection(section?: PortalPageSection) {
  if (!section) return null
  const payload = parseSectionContent(section)
  const contact = isRecord(payload.contactInfo) ? payload.contactInfo : payload

  return {
    address: firstText(contact.address, payload.address) || defaultContactInfo.address,
    phone: firstText(contact.phone, payload.phone) || defaultContactInfo.phone,
    email: firstText(contact.email, payload.email) || defaultContactInfo.email,
  }
}

function applyHomePageSections(sections: PortalPageSection[]) {
  const map: Record<string, PortalPageSection> = {}
  for (const section of sections) {
    if (homeSectionCodes.includes(section.sectionCode)) {
      map[section.sectionCode] = section
    }
  }
  pageSectionMap.value = map

  const mappedHero = mapHeroSection(map.hero)
  if (mappedHero) hero.value = mappedHero

  const mappedContact = mapContactSection(map.contact)
  if (mappedContact) contactInfo.value = mappedContact
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

function industrySolutionClass(index: number) {
  return industrySolutionClasses[index % industrySolutionClasses.length]
}

function customerTags(solution: { customerTags?: unknown }) {
  return Array.isArray(solution.customerTags) && solution.customerTags.length
    ? solution.customerTags.map(asText).filter(Boolean)
    : []
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
  const descriptions = productsSectionContent.value.capabilityDescriptions

  if (descriptions.length) {
    return descriptions[index % descriptions.length]
  }

  return capabilityDescriptions[index % capabilityDescriptions.length]
}

function capabilityItems(capability: { items?: unknown }) {
  return Array.isArray(capability.items) ? capability.items : []
}

function clientLogoFallback(index: number) {
  return clientLogoFallbackIcons[index % clientLogoFallbackIcons.length]
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

  const messages = ctaContent.value

  if (!contactName) return messages.contactNameRequiredMessage
  if (contactName.length > 64) return messages.contactNameMaxMessage
  if (!companyName) return messages.companyNameRequiredMessage
  if (companyName.length > 128) return messages.companyNameMaxMessage
  if (!email) return messages.emailRequiredMessage
  if (email.length > 128) return messages.emailMaxMessage
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return messages.emailInvalidMessage
  if (phone && phone.length > 64) return messages.phoneMaxMessage
  if (phone && !/^[0-9+\-()\s]+$/.test(phone)) return messages.phoneInvalidMessage
  if (demandContent && demandContent.length > 1000) return messages.demandMaxMessage

  return ''
}

async function loadHomePageSections() {
  try {
    const sections = await getPortalPageSections('home')
    pageSectionsFailed.value = false
    const normalizedSections = Array.isArray(sections) ? sections : []
    if (normalizedSections.length === 0) {
      isPageSectionFallback.value = true
      isPageSectionPartial.value = false
      pageSectionMap.value = {}
      return
    }
    const managedSectionCodes = new Set(
      normalizedSections
        .map((section) => section.sectionCode)
        .filter((sectionCode) => homeSectionCodes.includes(sectionCode)),
    )
    if (managedSectionCodes.size === 0) {
      isPageSectionFallback.value = true
      isPageSectionPartial.value = false
      pageSectionMap.value = {}
      return
    }
    isPageSectionFallback.value = false
    isPageSectionPartial.value = managedSectionCodes.size < homeSectionCodes.length
    applyHomePageSections(normalizedSections)
  } catch (error) {
    pageSectionsFailed.value = true
    isPageSectionFallback.value = true
    isPageSectionPartial.value = false
    pageSectionMap.value = {}
    console.error('[Portal API] page-sections failed, fallback to site.js', error)
  } finally {
    pageSectionsReady.value = true
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
    if (Array.isArray(data) && data.length > 0) products.value = data
  } catch (error) {
    console.error('[Portal API] products failed, fallback to site.js', error)
    products.value = [...defaultProducts]
  }
}

async function loadIndustrySolutions() {
  try {
    const data = await getPortalIndustrySolutions()
    if (Array.isArray(data) && data.length > 0) industrySolutions.value = data
  } catch (error) {
    console.error('[Portal API] industry-solutions failed, fallback to site.js', error)
    industrySolutions.value = [...defaultIndustrySolutions]
  }
}

async function loadCooperationDirectionTags() {
  try {
    const data = await getPortalCooperationDirectionTags()
    if (Array.isArray(data) && data.length > 0) cooperationDirectionTags.value = data
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
    if (Array.isArray(data) && data.length > 0) clientLogos.value = data
  } catch (error) {
    console.error('[Portal API] client-logos failed, fallback to site.js', error)
    clientLogos.value = [...defaultClientLogos]
  }
}

async function loadStrengthMetrics() {
  try {
    const data = await getPortalStrengthMetrics()
    if (Array.isArray(data) && data.length >= defaultStrengthMetrics.length) strengthMetrics.value = data
  } catch (error) {
    console.error('[Portal API] strength-metrics failed, fallback to site.js', error)
    strengthMetrics.value = [...defaultStrengthMetrics]
  }
}

async function loadPartnerUniversities() {
  try {
    const data = await getPortalPartnerUniversities()
    if (Array.isArray(data) && data.length > 0) partnerUniversities.value = data
  } catch (error) {
    console.error('[Portal API] partner-universities failed, fallback to site.js', error)
    partnerUniversities.value = [...defaultPartnerUniversities]
  }
}

async function loadTimelineEvents() {
  try {
    const data = await getPortalTimelineEvents()
    if (Array.isArray(data)) {
      const rows = mapTimelineRows(data).filter((item) => item.every(Boolean))
      if (rows.length >= defaultTimeline.length) timeline.value = rows
    }
  } catch (error) {
    console.error('[Portal API] timeline-events failed, fallback to site.js', error)
    timeline.value = mapTimelineRows(defaultTimelineEvents)
  }
}

async function loadResearchDirections() {
  try {
    const data = await getPortalResearchDirections()
    if (Array.isArray(data) && data.length > 0) researchDirections.value = data
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
    leadMessage.value = ctaContent.value.successMessage
    resetLeadForm()
  } catch (error) {
    console.error('[Portal API] leads failed', error)
    leadMessage.value = ctaContent.value.failureMessage
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadHomePageSections()
  loadHomeMetrics()
  loadHonors()
  loadProducts()
  loadIndustrySolutions()
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
