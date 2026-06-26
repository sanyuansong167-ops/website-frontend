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
          <Feature icon="BookOpen" color="orange" en="Knowledge" title="企业知识库" text="沉淀组织经验与业务知识" />
          <Feature icon="MessageSquare" color="cyan" en="Assistant" title="AI业务助手" text="辅助日常业务处理与协同" />
          <Feature icon="ChartNoAxesColumn" color="green" en="Analytics" title="智能分析" text="自动生成分析与决策支持" />
          <Feature icon="Bot" color="purple" en="Agent" title="企业智能体" text="推动业务流程智能化与自动化" />
        </div>
        <div class="center ai-cta"><a class="primary" href="#contact">探索AI智能体解决方案</a></div>
      </div>
    </section>

    <section id="products" class="section">
      <div class="container">
        <SectionTitle tag="产品体系" title="从能力底座到产品矩阵" desc="三层架构覆盖企业数字化全链路，五大产品让每一层能力都可落地" />
        <h3 class="base-title">能力底座</h3>
        <div class="base-cards">
          <div class="base-card management"><h4>企业经营管理能力</h4><p>帮助大型组织实现集团化、标准化与精细化运营</p><span>ERP</span><span>业财一体化</span><span>集团管控</span><span>供应链协同</span></div>
          <div class="base-card data"><h4>数据智能平台能力</h4><p>打通多源数据与业务流程，构建统一的数据资产体系</p><span>数据中台</span><span>数据仓库</span><span>BI分析</span><span>实时数据平台</span></div>
          <div class="base-card ai"><h4>AI创新应用能力</h4><p>推动AI进入真实业务场景</p><span>企业知识库</span><span>智能问答</span><span>AI助手</span><span>Agent平台</span></div>
        </div>
        <h3>产品矩阵</h3>
        <div class="product-grid">
          <router-link v-for="p in products" :key="p.id" class="product-card" :class="{ soon: p.id === 'agent' }" to="/product">
            <span class="status">{{ p.status }}</span>
            <IconBox :name="p.icon" :color="p.color" />
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
          <div><span>HUST</span><b>华中科技大学</b></div>
          <div><span>WHU</span><b>武汉大学</b></div>
          <div><span>SCUEC</span><b>中南民族大学</b></div>
        </div>
        <p class="innovation-note">围绕人工智能、数据治理、行业数字化与智能体应用开展联合研究与成果转化</p>
        <h3 class="innovation-subtitle">重点研发方向</h3>
        <div class="research-grid">
          <div class="research-card"><span class="research-icon"><BrainCircuit :size="34" /></span><small>Data Intelligence</small><h4>数据智能</h4><p>围绕企业数据资产化与智能分析能力建设</p></div>
          <div class="research-card"><span class="research-icon"><BookOpen :size="34" /></span><small>Knowledge Engineering</small><h4>知识工程</h4><p>沉淀组织知识，构建可复用的知识体系</p></div>
          <div class="research-card"><span class="research-icon"><Bot :size="34" /></span><small>AI Agent</small><h4>Agent 研发</h4><p>推进企业级智能体平台与场景应用研发</p></div>
          <div class="research-card"><span class="research-icon"><Lightbulb :size="34" /></span><small>Decision Intelligence</small><h4>智能决策</h4><p>探索数据驱动的分析、预警与决策支持能力</p></div>
        </div>
      </div>
    </section>

    <section id="cases" class="section soft">
      <div class="container">
        <SectionTitle tag="产品与行业方案" title="聚焦典型行业场景" desc="推动数字化与智能化价值落地" />
        <div class="case-grid">
          <router-link v-for="c in cases" :key="c.id" to="/case" class="case-card">
            <IconBox :name="c.industry.includes('能源') ? 'Zap' : 'Factory'" :color="c.industry.includes('能源') ? 'cyan' : 'orange'" />
            <span class="arrow">→</span>
            <h3>{{ c.industry }}</h3>
            <p>{{ c.desc }}</p>
            <div class="customer"><b>典型客户</b><small>{{ c.title }}</small></div>
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
              <span><i>🏗</i>天山材料</span>
              <span><i>⚡</i>中国核电</span>
              <span><i>📊</i>长江证券</span>
              <span><i>🌉</i>中国交建</span>
              <span><i>🏭</i>湖北烟草</span>
            </div>
          </div>
        </div>
        <div class="nums">
          <b><span class="num-icon"><Users :size="28" /></span>50+<small>服务客户</small></b>
          <b><span class="num-icon"><Building2 :size="28" /></span>5大领域<small>行业覆盖</small></b>
          <b><span class="num-icon"><Award :size="28" /></span>10+<small>资质认证</small></b>
          <b><span class="num-icon"><Trophy :size="28" /></span>100%<small>项目交付</small></b>
        </div>
      </div>
    </section>

    <section id="values" class="section values-section">
      <div class="container">
        <SectionTitle tag="关于我们" title="核心价值观" />
        <div class="values">
          <div><IconBox name="Users" /><h3>同事</h3><b>相知相惜，并肩精进</b><p>相互尊重、相互支持，在协作中不断成长</p></div>
          <div><IconBox name="Handshake" /><h3>同仁</h3><b>协同合作，共创价值</b><p>与客户、伙伴携手同行，以专业能力创造共赢价值</p></div>
          <div><IconBox name="Heart" /><h3>同享</h3><b>同享收益，共担沉浮</b><p>分享成功的喜悦，共同面对挑战，建立长期信任</p></div>
        </div>
        <div class="promise"><h3>我们的承诺</h3><p>用更过硬的技术、更简便的操作、更实用的功能，回报每一位客户的关心、支持与信任。</p><span>过硬的技术</span><span>简便的操作</span><span>实用的功能</span></div>
      </div>
    </section>

    <section id="contact" class="section soft">
      <div class="container">
        <SectionTitle tag="联系我们" title="期待与您共同探索未来" desc="无论您正在规划数字化转型、建设数据平台，还是探索人工智能应用落地" />
        <div class="contact-grid">
          <div>
            <div class="contact-card"><h3>联系方式</h3><p><b>地址</b><br>武汉 · 中国光谷</p><p><b>商务咨询</b><br>预约洽谈</p><p><b>邮箱联系</b><br>business@yuntaidata.com</p></div>
            <div class="blue-box"><h3>合作方向</h3><span>企业数字化建设</span><span>数据平台建设</span><span>AI应用开发</span><span>Agent场景落地</span><span>系统集成与咨询服务</span></div>
          </div>
          <form class="form">
            <h3>预约交流</h3>
            <div class="form-row"><label>姓名 *<input placeholder="您的姓名" /></label><label>公司 *<input placeholder="公司名称" /></label></div>
            <div class="form-row"><label>邮箱 *<input placeholder="your@email.com" /></label><label>电话<input placeholder="联系电话" /></label></div>
            <label>需求描述<textarea placeholder="请简要描述您的需求..."></textarea></label>
            <button type="button" class="primary full">提交预约</button>
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
import { products, cases, timeline, hero as defaultHero, metrics as defaultMetrics, honors as defaultHonors } from '../data/site'
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Award, BarChart3, Bot, BrainCircuit, Building2, CalendarDays, Check, ClipboardList, BookOpen, GraduationCap, Landmark, Lightbulb, Trophy, Users, Zap } from 'lucide-vue-next'
import { getHomeBanner, getHomeMetrics, getHonors } from '../api/portal'

const hero = ref({ ...defaultHero })
const metrics = ref([...defaultMetrics])
const honors = ref([...defaultHonors])

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

onMounted(() => {
  loadHomeBanner()
  loadHomeMetrics()
  loadHonors()
})</script>
