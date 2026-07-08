<template>
  <section class="admin-dashboard">
    <header class="admin-dashboard__header">
      <div>
        <p>Operation Dashboard</p>
        <h2>运营驾驶舱</h2>
      </div>
      <div class="admin-dashboard__user">
        <span>{{ userName }}</span>
        <strong>{{ roleCode }}</strong>
      </div>
    </header>

    <p v-if="errorMessage" class="admin-dashboard__error">{{ errorMessage }}</p>

    <section class="admin-dashboard__quick">
      <div class="admin-dashboard__section-title">
        <h3>快捷入口</h3>
        <span>高频运营动作一键进入</span>
      </div>
      <div class="admin-dashboard__quick-grid">
        <router-link
          v-for="action in quickActions"
          :key="action.to"
          class="admin-dashboard__quick-action"
          :to="action.to"
        >
          <component :is="action.icon" :size="18" aria-hidden="true" />
          <span>{{ action.label }}</span>
        </router-link>
      </div>
    </section>

    <DashboardSection
      title="内容统计"
      subtitle="产品、案例、AI 能力、媒体与业务页面"
      :items="contentStatCards"
      :loading="loading"
    />

    <DashboardSection
      title="Lead 统计"
      subtitle="线索总量、本月新增与处理状态"
      :items="leadStatCards"
      :loading="loading"
    />

    <DashboardSection
      title="媒体统计"
      subtitle="按媒体类型统计可用资产"
      :items="mediaStatCards"
      :loading="loading"
    />

    <DashboardSection
      title="业务统计"
      subtitle="AI能力中心、医疗、教育、工业、砼云"
      :items="businessStatCards"
      :loading="loading"
    />

    <DashboardSection
      title="风险提醒"
      subtitle="未发布、失效、引用保护与待处理线索"
      :items="riskAlertCards"
      :loading="loading"
    />
  </section>
</template>

<script setup lang="ts">
import { BriefcaseBusiness, FolderPlus, ImagePlus, PackagePlus, UsersRound } from 'lucide-vue-next'
import { computed, defineComponent, h, onMounted, ref, type PropType } from 'vue'
import {
  getAdminDashboardBusinessStats,
  getAdminDashboardContentStats,
  getAdminDashboardLeadStats,
  getAdminDashboardMediaStats,
  getAdminDashboardRiskAlerts,
  type AdminDashboardBusinessStats,
  type AdminDashboardContentStats,
  type AdminDashboardLeadStats,
  type AdminDashboardMediaStats,
  type AdminDashboardRiskAlerts,
} from '../api/adminDashboard'

type DashboardCard = {
  key: string
  label: string
  value: number
  hint: string
}

const quickActions = [
  { label: '新增产品', to: '/admin/products', icon: PackagePlus },
  { label: '新增案例', to: '/admin/cases', icon: FolderPlus },
  { label: '新增业务', to: '/admin/site-modules/business-registry', icon: BriefcaseBusiness },
  { label: '新增媒体', to: '/admin/media', icon: ImagePlus },
  { label: '查看 Lead', to: '/admin/leads', icon: UsersRound },
]

const DashboardSection = defineComponent({
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    items: { type: Array as PropType<DashboardCard[]>, required: true },
    loading: { type: Boolean, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'admin-dashboard__section' }, [
        h('div', { class: 'admin-dashboard__section-title' }, [
          h('h3', props.title),
          h('span', props.subtitle),
        ]),
        h('div', { class: 'admin-dashboard__summary' }, props.items.map((item) =>
          h('article', { key: item.key }, [
            h('span', item.label),
            h('strong', props.loading ? '-' : String(item.value)),
            h('p', item.hint),
          ]),
        )),
      ])
  },
})

const props = defineProps<{
  currentUser?: Record<string, unknown> | null
}>()

const loading = ref(false)
const errorMessage = ref('')
const contentStats = ref<AdminDashboardContentStats>({
  productCount: 0,
  caseCount: 0,
  aiAbilityCount: 0,
  mediaCount: 0,
  pageCount: 0,
})
const leadStats = ref<AdminDashboardLeadStats>({
  totalCount: 0,
  currentMonthNewCount: 0,
  pendingCount: 0,
  handledCount: 0,
})
const mediaStats = ref<AdminDashboardMediaStats>({
  imageCount: 0,
  videoCount: 0,
  documentCount: 0,
})
const businessStats = ref<AdminDashboardBusinessStats>({
  modules: [],
})
const riskAlerts = ref<AdminDashboardRiskAlerts>({
  unpublishedContentCount: 0,
  invalidContentCount: 0,
  referencedContentCount: 0,
  pendingLeadCount: 0,
})

const userName = computed(() => String(props.currentUser?.displayName || props.currentUser?.username || '读取中'))
const roleCode = computed(() => String(props.currentUser?.roleCode || 'ADMIN'))
const contentStatCards = computed<DashboardCard[]>(() => [
  { key: 'products', label: '产品数', value: contentStats.value.productCount, hint: '产品中心内容总量' },
  { key: 'cases', label: '案例数', value: contentStats.value.caseCount, hint: '案例中心内容总量' },
  { key: 'ai', label: 'AI能力数', value: contentStats.value.aiAbilityCount, hint: 'AI 卡片能力资产' },
  { key: 'media', label: '媒体数', value: contentStats.value.mediaCount, hint: '媒体库可用资产总量' },
  { key: 'pages', label: '页面数', value: contentStats.value.pageCount, hint: '业务页面资产总量' },
])
const leadStatCards = computed<DashboardCard[]>(() => [
  { key: 'lead-total', label: 'Lead总数', value: leadStats.value.totalCount, hint: '全部有效线索记录' },
  { key: 'lead-month', label: '本月新增', value: leadStats.value.currentMonthNewCount, hint: '本月提交的新线索' },
  { key: 'lead-pending', label: '待处理', value: leadStats.value.pendingCount, hint: '尚未进入跟进的线索' },
  { key: 'lead-handled', label: '已处理', value: leadStats.value.handledCount, hint: '处理中或已归档线索' },
])
const mediaStatCards = computed<DashboardCard[]>(() => [
  { key: 'media-image', label: '图片', value: mediaStats.value.imageCount, hint: 'IMAGE 类型媒体' },
  { key: 'media-video', label: '视频', value: mediaStats.value.videoCount, hint: 'VIDEO 类型媒体' },
  { key: 'media-document', label: '文档', value: mediaStats.value.documentCount, hint: 'DOCUMENT 类型媒体' },
])
const businessStatCards = computed<DashboardCard[]>(() =>
  businessStats.value.modules.map((item) => ({
    key: item.businessCode,
    label: item.businessName || item.businessCode,
    value: item.contentCount,
    hint: `${item.businessStatus || 'UNCONFIGURED'} / 页面 ${item.pageCount} / 区块 ${item.pageBlockCount}`,
  })),
)
const riskAlertCards = computed<DashboardCard[]>(() => [
  {
    key: 'risk-unpublished',
    label: '未发布内容',
    value: riskAlerts.value.unpublishedContentCount,
    hint: '草稿状态的产品、案例、业务与页面',
  },
  {
    key: 'risk-invalid',
    label: '失效内容',
    value: riskAlerts.value.invalidContentCount,
    hint: '已下线的产品、案例、业务与页面',
  },
  {
    key: 'risk-referenced',
    label: '被引用内容',
    value: riskAlerts.value.referencedContentCount,
    hint: '存在引用关系，删除前需先解除引用',
  },
  {
    key: 'risk-pending-lead',
    label: '待处理Lead',
    value: riskAlerts.value.pendingLeadCount,
    hint: '尚未进入跟进状态的线索',
  },
])

async function loadDashboardStats() {
  loading.value = true
  errorMessage.value = ''
  try {
    const [contentData, leadData, mediaData, businessData, riskData] = await Promise.all([
      getAdminDashboardContentStats(),
      getAdminDashboardLeadStats(),
      getAdminDashboardMediaStats(),
      getAdminDashboardBusinessStats(),
      getAdminDashboardRiskAlerts(),
    ])
    contentStats.value = contentData
    leadStats.value = leadData
    mediaStats.value = mediaData
    businessStats.value = businessData
    riskAlerts.value = riskData
  } catch (error) {
    console.warn('[admin dashboard stats failed]', error)
    errorMessage.value = '驾驶舱统计加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadDashboardStats()
})
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  gap: 18px;
  color: #1f2937;
}

.admin-dashboard__header,
.admin-dashboard__summary article,
.admin-dashboard__quick,
.admin-dashboard__section {
  border: 1px solid #d9dee6;
  border-radius: 8px;
  background: #fff;
}

.admin-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.admin-dashboard__header p {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.admin-dashboard__header h2,
.admin-dashboard__section-title h3 {
  margin: 0;
  color: #111827;
}

.admin-dashboard__header h2 {
  font-size: 22px;
}

.admin-dashboard__section-title h3 {
  font-size: 18px;
}

.admin-dashboard__user {
  display: grid;
  justify-items: end;
  gap: 4px;
  color: #475569;
}

.admin-dashboard__user span {
  font-weight: 800;
}

.admin-dashboard__user strong {
  color: #2563eb;
  font-size: 12px;
}

.admin-dashboard__section {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.admin-dashboard__section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.admin-dashboard__section-title span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.admin-dashboard__summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 14px;
}

.admin-dashboard__summary article {
  min-width: 0;
  padding: 18px;
  background: #f8fafc;
}

.admin-dashboard__summary span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.admin-dashboard__summary strong {
  display: block;
  margin-top: 12px;
  color: #111827;
  font-size: 28px;
  line-height: 1.1;
}

.admin-dashboard__summary p {
  margin: 10px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.admin-dashboard__error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 6px;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
}

.admin-dashboard__quick {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.admin-dashboard__quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.admin-dashboard__quick-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #1f2937;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.admin-dashboard__quick-action:hover {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

@media (max-width: 720px) {
  .admin-dashboard__header,
  .admin-dashboard__section-title {
    align-items: stretch;
    flex-direction: column;
  }

  .admin-dashboard__user {
    justify-items: start;
  }
}
</style>
