<template>
  <section class="lead-manage">
    <div class="lead-manage__toolbar">
      <div>
        <h2>线索管理</h2>
        <p>查看前台预约交流记录，支持状态更新和 Excel 导出。</p>
      </div>
      <div class="lead-manage__toolbar-actions">
        <button type="button" :disabled="loading" @click="loadLeads">刷新</button>
        <button type="button" :disabled="exporting || !canExportFiltered" @click="handleExportFiltered">
          {{ exporting ? '导出中...' : '筛选导出' }}
        </button>
        <button type="button" :disabled="exporting || !selectedIds.length" @click="handleExportSelected">
          选中导出
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="lead-manage__error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="lead-manage__success">{{ successMessage }}</p>

    <form class="lead-manage__filters" @submit.prevent="handleSearch">
      <label>
        <span>状态</span>
        <select v-model="filters.status">
          <option value="">全部</option>
          <option v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </label>
      <label>
        <span>提交开始时间</span>
        <input v-model="filters.submitAtStart" type="datetime-local" />
      </label>
      <label>
        <span>提交结束时间</span>
        <input v-model="filters.submitAtEnd" type="datetime-local" />
      </label>
      <button type="submit" :disabled="loading">查询</button>
    </form>

    <div class="lead-manage__content">
      <div class="lead-manage__list">
        <header>
          <div>
            <h3>线索列表</h3>
            <span>{{ page.total }} 条记录</span>
          </div>
          <div class="lead-manage__pager">
            <button type="button" :disabled="loading || page.pageNo <= 1" @click="changePage(-1)">上一页</button>
            <span>第 {{ page.pageNo }} 页</span>
            <button type="button" :disabled="loading || page.pageNo * page.pageSize >= page.total" @click="changePage(1)">
              下一页
            </button>
          </div>
        </header>

        <div v-if="loading" class="lead-manage__empty">正在读取线索列表...</div>
        <div v-else-if="!leads.length" class="lead-manage__empty">暂无线索记录</div>

        <table v-else>
          <thead>
            <tr>
              <th>选择</th>
              <th>客户</th>
              <th>联系方式</th>
              <th>需求</th>
              <th>状态</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lead in leads" :key="lead.id">
              <td>
                <input type="checkbox" :value="lead.id" v-model="selectedIds" />
              </td>
              <td>
                <strong>{{ lead.name }}</strong>
                <small>{{ lead.company || '-' }}</small>
              </td>
              <td>
                <span>{{ lead.maskedPhone || '-' }}</span>
                <small>{{ lead.maskedEmail || '-' }}</small>
              </td>
              <td>{{ lead.demandDescriptionPreview || '-' }}</td>
              <td>
                <span :class="['lead-manage__status', `status-${lead.status}`]">
                  {{ lead.statusLabel || getStatusLabel(lead.status) }}
                </span>
              </td>
              <td>{{ lead.submittedAt || '-' }}</td>
              <td>
                <button type="button" @click="loadLeadDetail(lead.id)">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <aside class="lead-manage__detail">
        <h3>线索详情</h3>
        <div v-if="detailLoading" class="lead-manage__empty">正在读取详情...</div>
        <div v-else-if="!selectedLead" class="lead-manage__empty">请选择一条线索</div>
        <div v-else class="lead-manage__detail-body">
          <dl>
            <dt>姓名</dt>
            <dd>{{ selectedLead.name }}</dd>
            <dt>公司</dt>
            <dd>{{ selectedLead.company || '-' }}</dd>
            <dt>电话</dt>
            <dd>{{ selectedLead.phone || '-' }}</dd>
            <dt>邮箱</dt>
            <dd>{{ selectedLead.email || '-' }}</dd>
            <dt>需求</dt>
            <dd>{{ selectedLead.demandDescription || '-' }}</dd>
            <dt>提交 IP</dt>
            <dd>{{ selectedLead.submitIp || '-' }}</dd>
            <dt>Version</dt>
            <dd>{{ selectedLead.version }}</dd>
          </dl>

          <form class="lead-manage__status-form" @submit.prevent="handleStatusUpdate">
            <label>
              <span>状态</span>
              <select v-model.number="detailStatus" :disabled="statusSaving">
                <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </label>
            <button type="submit" :disabled="statusSaving">{{ statusSaving ? '更新中...' : '更新状态' }}</button>
          </form>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  exportAdminLeads,
  getAdminLeadDetail,
  getAdminLeads,
  updateAdminLeadStatus,
} from '../api/adminLead'

const statusOptions = [
  { value: 0, label: '未处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已归档' },
  { value: 3, label: '无效线索' },
]
const leads = ref([])
const selectedIds = ref([])
const selectedLead = ref(null)
const detailStatus = ref(0)
const loading = ref(true)
const detailLoading = ref(false)
const statusSaving = ref(false)
const exporting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const page = reactive({
  pageNo: 1,
  pageSize: 20,
  total: 0,
})
const filters = reactive({
  status: '',
  submitAtStart: '',
  submitAtEnd: '',
})
const canExportFiltered = computed(() => Boolean(filters.status !== '' || filters.submitAtStart || filters.submitAtEnd))

function getStatusLabel(value) {
  return statusOptions.find((item) => item.value === Number(value))?.label || '-'
}

function buildQuery() {
  return {
    pageNo: page.pageNo,
    pageSize: page.pageSize,
    status: filters.status === '' ? '' : Number(filters.status),
    submitAtStart: filters.submitAtStart || undefined,
    submitAtEnd: filters.submitAtEnd || undefined,
  }
}

function buildFilteredExportPayload() {
  return {
    exportMode: 'FILTERED',
    status: filters.status === '' ? null : Number(filters.status),
    submitAtStart: filters.submitAtStart || undefined,
    submitAtEnd: filters.submitAtEnd || undefined,
  }
}

function saveBlob(blob) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `leads_${Date.now()}.xlsx`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

async function loadLeads() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getAdminLeads(buildQuery())
    leads.value = Array.isArray(data.list) ? data.list : []
    page.total = Number(data.total || 0)
    page.pageNo = Number(data.pageNo || page.pageNo)
    page.pageSize = Number(data.pageSize || page.pageSize)
    selectedIds.value = selectedIds.value.filter((id) => leads.value.some((lead) => lead.id === id))
  } catch (error) {
    errorMessage.value = error?.message || '读取线索列表失败'
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  page.pageNo = 1
  selectedLead.value = null
  selectedIds.value = []
  await loadLeads()
}

async function changePage(direction) {
  page.pageNo += direction
  selectedIds.value = []
  await loadLeads()
}

async function loadLeadDetail(id) {
  detailLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    selectedLead.value = await getAdminLeadDetail(id)
    detailStatus.value = Number(selectedLead.value.status)
  } catch (error) {
    errorMessage.value = error?.message || '读取线索详情失败'
  } finally {
    detailLoading.value = false
  }
}

async function handleStatusUpdate() {
  if (!selectedLead.value) return
  statusSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateAdminLeadStatus(selectedLead.value.id, {
      status: Number(detailStatus.value),
      version: selectedLead.value.version,
    })
    successMessage.value = '线索状态已更新'
    await loadLeadDetail(selectedLead.value.id)
    await loadLeads()
  } catch (error) {
    errorMessage.value = error?.message || '更新线索状态失败'
  } finally {
    statusSaving.value = false
  }
}

async function handleExportFiltered() {
  if (!canExportFiltered.value) return
  exporting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    saveBlob(await exportAdminLeads(buildFilteredExportPayload()))
    successMessage.value = '导出请求已完成'
  } catch (error) {
    errorMessage.value = error?.message || '导出线索失败'
  } finally {
    exporting.value = false
  }
}

async function handleExportSelected() {
  if (!selectedIds.value.length) return
  exporting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    saveBlob(await exportAdminLeads({
      exportMode: 'SELECTED',
      selectedIds: selectedIds.value,
    }))
    successMessage.value = '导出请求已完成'
  } catch (error) {
    errorMessage.value = error?.message || '导出线索失败'
  } finally {
    exporting.value = false
  }
}

onMounted(loadLeads)
</script>

<style scoped>
.lead-manage {
  display: grid;
  gap: 18px;
}

.lead-manage__toolbar,
.lead-manage__filters,
.lead-manage__list,
.lead-manage__detail {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.lead-manage__toolbar,
.lead-manage__toolbar-actions,
.lead-manage__list header,
.lead-manage__pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lead-manage h2,
.lead-manage h3,
.lead-manage p {
  margin: 0;
}

.lead-manage h2 {
  color: #111827;
  font-size: 22px;
}

.lead-manage h3 {
  color: #111827;
  font-size: 18px;
}

.lead-manage p,
.lead-manage header span {
  margin-top: 8px;
  color: #64748b;
}

.lead-manage__filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  align-items: end;
}

.lead-manage label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.lead-manage input,
.lead-manage select {
  width: 100%;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.lead-manage input[type='checkbox'] {
  width: 18px;
  height: 18px;
  padding: 0;
}

.lead-manage button {
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.lead-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.lead-manage__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

.lead-manage table {
  width: 100%;
  margin-top: 18px;
  border-collapse: collapse;
}

.lead-manage th,
.lead-manage td {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.lead-manage th {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.lead-manage td strong,
.lead-manage td span,
.lead-manage td small {
  display: block;
}

.lead-manage td small {
  margin-top: 5px;
  color: #64748b;
}

.lead-manage__status {
  display: inline-block;
  width: max-content;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 900;
}

.lead-manage__status.status-2 {
  background: #dcfce7;
  color: #047857;
}

.lead-manage__status.status-3 {
  background: #fee2e2;
  color: #b91c1c;
}

.lead-manage__detail-body {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.lead-manage dl {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px 12px;
  margin: 0;
}

.lead-manage dt {
  color: #64748b;
  font-weight: 800;
}

.lead-manage dd {
  margin: 0;
  color: #111827;
}

.lead-manage__status-form {
  display: grid;
  gap: 12px;
}

.lead-manage__empty {
  margin-top: 18px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
}

.lead-manage__error,
.lead-manage__success {
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.lead-manage__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.lead-manage__success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}

@media (max-width: 1120px) {
  .lead-manage__content,
  .lead-manage__filters {
    grid-template-columns: 1fr;
  }

  .lead-manage__toolbar,
  .lead-manage__toolbar-actions,
  .lead-manage__list header,
  .lead-manage__pager {
    align-items: stretch;
    flex-direction: column;
  }

  .lead-manage table {
    display: block;
    overflow-x: auto;
  }
}
</style>
