<template>
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <div class="brand light">
          <div class="logo-mark">{{ footerConfig.logoText }}</div>
          <div><strong>{{ footerConfig.brandName }}</strong><span>{{ footerConfig.slogan }}</span></div>
        </div>
        <p>{{ footerConfig.description }}</p>
        <div class="social"><span>in</span><span>→</span><span>Y</span></div>
      </div>
      <div><h4>{{ footerConfig.quickLinksTitle }}</h4><a v-for="link in quickLinks" :key="link.label" :href="link.href">{{ link.label }}</a></div>
      <div><h4>{{ footerConfig.servicesTitle }}</h4><a v-for="service in serviceLinks" :key="service.label" :href="service.href">{{ service.label }}</a></div>
      <div><h4>{{ footerConfig.contactTitle }}</h4><a v-if="contactInfo.address">{{ contactInfo.address }}</a><a v-if="contactInfo.phone">{{ contactInfo.phone }}</a><a v-if="contactInfo.email">{{ contactInfo.email }}</a></div>
    </div>
    <div class="container copyright"><span>{{ footerConfig.copyright }}</span><span>{{ footerConfig.legalText }}</span></div>
  </footer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { contactInfo as defaultContactInfo, navigation as defaultNavigation, siteConfig as defaultSiteConfig } from '../data/site'
import { getNavigation, getPortalContactInfo, getSiteConfig } from '../api/portal'

const contactInfo = ref({ ...defaultContactInfo })
const footerConfig = ref({
  logoText: defaultSiteConfig.logoText,
  brandName: defaultSiteConfig.name,
  slogan: defaultSiteConfig.slogan,
  description: '让组织拥有持续进化的数字智能能力。十余年深耕企业数字化与智能化建设。',
  quickLinksTitle: '快速链接',
  servicesTitle: '服务领域',
  contactTitle: '联系我们',
  copyright: '© 2026 武汉云台数据有限公司 版权所有',
  legalText: '隐私政策　服务条款　鄂ICP备XXXXXXX号',
})
const quickLinks = ref(mapNavigationLinks(defaultNavigation).slice(1, 5))
const serviceLinks = ref([
  { label: '企业数字化建设', href: '#contact' },
  { label: '数据平台建设', href: '#contact' },
  { label: 'AI应用开发', href: '#ai' },
  { label: 'Agent场景落地', href: '#ai' },
  { label: '系统集成与咨询', href: '#contact' },
])

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

function getListSource(data) {
  if (Array.isArray(data)) return data
  if (isRecord(data) && Array.isArray(data.list)) return data.list
  if (isRecord(data) && Array.isArray(data.records)) return data.records
  return []
}

function mapNavigationLinks(data) {
  return getListSource(data)
    .map((item) => {
      if (!isRecord(item)) return null
      const label = firstText(item.menuName, item.label, item.name, item.title)
      if (!label) return null
      const href = firstText(item.href, item.url, item.path, item.link, item.routePath)
      const anchor = firstText(item.anchorCode, item.id, item.menuCode, item.code, item.key)
      return {
        label,
        href: href || (anchor ? `#${anchor}` : '#'),
      }
    })
    .filter(Boolean)
}

function normalizeFooterLinks(value, fallbackHref = '#contact') {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return { label: item, href: fallbackHref }
        if (!isRecord(item)) return null
        const label = firstText(item.label, item.name, item.title, item.text)
        if (!label) return null
        return { label, href: firstText(item.href, item.url, item.path, item.link) || fallbackHref }
      })
      .filter(Boolean)
  }

  const text = asText(value)
  if (!text) return []
  return text
    .split(/[,，、\n]/)
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ label, href: fallbackHref }))
}

function mapFooterConfig(data) {
  if (!isRecord(data)) return null
  const footer = isRecord(data.footer) ? data.footer : data
  const companyName = firstText(footer.companyName, data.companyName, data.siteTitle, data.siteName, data.name)
  const legalItems = [
    firstText(footer.privacyText, footer.privacyPolicyText, '隐私政策'),
    firstText(footer.termsText, footer.serviceTermsText, '服务条款'),
    firstText(footer.icpText, footer.icpNumber, footer.beianNumber, '鄂ICP备XXXXXXX号'),
  ].filter(Boolean)

  return {
    logoText: firstText(footer.logoText, data.logoText, defaultSiteConfig.logoText),
    brandName: firstText(footer.brandName, footer.siteShortName, data.siteShortName, data.siteName, data.name, defaultSiteConfig.name),
    slogan: firstText(footer.slogan, data.brandTagline, data.brandSlogan, data.slogan, defaultSiteConfig.slogan),
    description: firstText(footer.description, footer.footerDescription, data.brandSlogan, data.seoDescription, footerConfig.value.description),
    quickLinksTitle: firstText(footer.quickLinksTitle, footerConfig.value.quickLinksTitle),
    servicesTitle: firstText(footer.servicesTitle, footerConfig.value.servicesTitle),
    contactTitle: firstText(footer.contactTitle, footerConfig.value.contactTitle),
    copyright: firstText(footer.copyright, footer.copyrightText, companyName ? `© 2026 ${companyName} 版权所有` : '', footerConfig.value.copyright),
    legalText: firstText(footer.legalText, legalItems.join('　'), footerConfig.value.legalText),
  }
}

async function loadContactInfo() {
  try {
    contactInfo.value = await getPortalContactInfo()
  } catch (error) {
    console.error('[Portal API] footer contact-info failed, fallback to site.js', error)
    contactInfo.value = { ...defaultContactInfo }
  }
}

async function loadSiteFooterConfig() {
  try {
    const data = await getSiteConfig()
    const mapped = mapFooterConfig(data)
    if (mapped) footerConfig.value = mapped

    if (isRecord(data)) {
      const footer = isRecord(data.footer) ? data.footer : data
      const services = normalizeFooterLinks(footer.footerServices ?? footer.serviceLinks ?? footer.serviceAreas)
      if (services.length) serviceLinks.value = services
      const links = normalizeFooterLinks(footer.footerQuickLinks ?? footer.quickLinks, '#')
      if (links.length) quickLinks.value = links
    }
  } catch (error) {
    console.error('[Portal API] footer site-config failed, fallback to site.js', error)
  }
}

async function loadFooterNavigation() {
  try {
    const mapped = mapNavigationLinks(await getNavigation())
    if (mapped.length) quickLinks.value = mapped
  } catch (error) {
    console.error('[Portal API] footer navigation failed, fallback to site.js', error)
  }
}

onMounted(() => {
  loadContactInfo()
  loadSiteFooterConfig()
  loadFooterNavigation()
})
</script>

<style scoped>
.footer {
  padding: 56px 0 30px;
  background: #0f172a;
  color: #97a3b6;
}

.footer .container {
  width: 100%;
  max-width: 1416px;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 0;
  align-items: start;
}

.footer-grid > div {
  min-width: 0;
}

.footer-grid > div:first-child {
  max-width: 320px;
}

.brand.light {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 156px;
  margin-bottom: 22px;
}

.brand.light .logo-mark {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 9px;
}

.brand.light strong {
  display: block;
  color: #fff;
  font-size: 21px;
  line-height: 1.15;
  font-weight: 900;
}

.brand.light span {
  display: block;
  margin-top: 4px;
  color: #7f8da1;
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.footer p {
  margin: 0 0 22px;
  color: #a4afbf;
  font-size: 16px;
  line-height: 1.9;
  font-weight: 700;
}

.social {
  display: flex;
  gap: 14px;
  align-items: center;
}

.social span {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  margin: 0;
  border-radius: 50%;
  background: #1e293b;
  color: #9aa8ba;
  font-size: 13px;
  font-weight: 900;
}

.footer h4 {
  margin: 0 0 22px;
  color: #f8fafc;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 900;
}

.footer a {
  display: block;
  margin: 0 0 15px;
  color: #a4afbf;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 800;
}

.footer-grid > div:nth-child(4) a {
  margin-bottom: 18px;
}

.copyright {
  max-width: 1416px;
  margin-top: 58px;
  padding-top: 28px;
  border-top: 1px solid #243044;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  color: #8d9aab;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
}

.copyright span:last-child {
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .footer {
    padding: 42px 0 24px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    row-gap: 32px;
  }

  .footer-grid > div:first-child {
    max-width: none;
  }

  .brand.light {
    margin-left: 0;
  }

  .copyright {
    margin-top: 36px;
    flex-direction: column;
    align-items: flex-start;
  }

  .copyright span:last-child {
    text-align: left;
    white-space: normal;
  }
}
</style>
