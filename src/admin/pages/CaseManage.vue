<template>
  <section class="case-manage">
    <div class="case-manage__toolbar">
      <div>
        <h2>案例管理</h2>
        <p>维护官网案例展示内容，保存后前台通过 /portal/api/cases 读取最新数据。</p>
      </div>
      <div class="case-manage__toolbar-actions">
        <button type="button" :disabled="loading" @click="loadCases">刷新</button>
        <button type="button" :disabled="saving" @click="resetForm">新增案例</button>
      </div>
    </div>

    <p v-if="errorMessage" class="case-manage__error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="case-manage__success">{{ successMessage }}</p>

    <form class="case-manage__form" @submit.prevent="handleSubmit">
      <header>
        <h3>{{ editingCaseId ? '编辑案例' : '新增案例' }}</h3>
        <span v-if="editingCaseId">ID: {{ editingCaseId }} / version: {{ form.version }}</span>
      </header>

      <div class="case-manage__grid">
        <label>
          <span>项目标题 *</span>
          <input v-model.trim="form.title" maxlength="128" :disabled="saving" />
        </label>

        <label>
          <span>封面媒体 ID *</span>
          <input v-model.trim="form.logoMediaId" inputmode="numeric" :disabled="saving" />
        </label>

        <label class="case-manage__wide">
          <span>成效摘要 *</span>
          <textarea v-model.trim="form.summary" maxlength="512" :disabled="saving"></textarea>
        </label>

        <label class="case-manage__wide">
          <span>关键词</span>
          <input
            v-model.trim="form.keywordsText"
            maxlength="320"
            placeholder="多个关键词用逗号分隔，最多 10 个"
            :disabled="saving"
          />
        </label>

        <label>
          <span>是否展示</span>
          <select v-model="form.visible" :disabled="saving">
            <option :value="true">展示</option>
            <option :value="false">隐藏</option>
          </select>
        </label>

        <label>
          <span>内容状态</span>
          <select v-model="form.status" :disabled="saving">
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
            <option value="OFFLINE">已下线</option>
          </select>
        </label>
      </div>

      <div class="case-manage__form-actions">
        <router-link to="/admin/media">去上传封面</router-link>
        <div>
          <button type="button" :disabled="saving" @click="resetForm">清空</button>
          <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存案例' }}</button>
        </div>
      </div>
    </form>

    <div class="case-manage__list">
      <header>
        <div>
          <h3>案例列表</h3>
          <span>{{ page.total }} 条记录</span>
        </div>
        <button type="button" :disabled="sortSaving || !canSaveSort" @click="handleSaveSort">
          {{ sortSaving ? '排序保存中...' : '保存当前顺序' }}
        </button>
      </header>

      <div v-if="loading" class="case-manage__empty">正在读取案例列表...</div>
      <div v-else-if="!cases.length" class="case-manage__empty">暂无案例数据</div>

      <table v-else>
        <thead>
          <tr>
            <th>排序</th>
            <th>案例</th>
            <th>封面</th>
            <th>关键词</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in cases" :key="item.id">
            <td>
              <div class="case-manage__order">
                <button type="button" :disabled="index === 0" @click="moveCase(index, -1)">上移</button>
                <button type="button" :disabled="index === cases.length - 1" @click="moveCase(index, 1)">下移</button>
              </div>
            </td>
            <td>
              <strong>{{ item.title }}</strong>
              <small>{{ item.summary }}</small>
              <small>排序值：{{ item.sortOrder }}</small>
            </td>
            <td>
              <img v-if="item.logoUrl" :src="item.logoUrl" alt="" />
              <span v-else>ID: {{ item.logoMediaId || '-' }}</span>
            </td>
            <td>
              <span v-if="!item.keywords?.length">-</span>
              <span v-for="keyword in item.keywords" v-else :key="keyword" class="case-manage__tag">
                {{ keyword }}
              </span>
            </td>
            <td>
              <span :class="['case-manage__status', item.visible ? 'is-visible' : '']">
                {{ item.visible ? '展示' : '隐藏' }}
              </span>
              <span :class="['case-manage__content-status', statusClass(item.status)]">
                {{ statusLabel(item.status) }}
              </span>
            </td>
            <td>
              <button type="button" @click="editCase(item)">编辑</button>
              <button type="button" @click="changeCaseStatus(item, 'DRAFT')">草稿</button>
              <button type="button" @click="changeCaseStatus(item, 'PUBLISHED')">发布</button>
              <button type="button" @click="changeCaseStatus(item, 'OFFLINE')">下线</button>
              <button type="button" class="is-danger" @click="handleDelete(item)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="cases.length && !canSaveSort" class="case-manage__hint">
        当前列表未覆盖全部案例，后端排序接口要求完整覆盖全部活跃案例，因此暂不可保存排序。
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  createAdminCase,
  deleteAdminCase,
  getAdminCases,
  reorderAdminCases,
  updateAdminCase,
  updateAdminCaseStatus,
} from '../api/adminCase'

const pageSize = 100
const cases = ref([])
const loading = ref(true)
const saving = ref(false)
const sortSaving = ref(false)
const editingCaseId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const page = reactive({
  total: 0,
  pageNo: 1,
  pageSize,
})
const form = reactive(emptyForm())
const canSaveSort = computed(() => cases.value.length > 0 && cases.value.length === Number(page.total))

function emptyForm() {
  return {
    title: '',
    logoMediaId: '',
    summary: '',
    keywordsText: '',
    visible: true,
    status: 'DRAFT',
    version: 0,
  }
}

function fillForm(values) {
  Object.assign(form, emptyForm(), values)
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

function parseKeywords(value) {
  return String(value || '')
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function applyCaseList(list) {
  if (!Array.isArray(list)) return
  cases.value = list
  page.total = list.length
  page.pageNo = 1
  page.pageSize = pageSize
}

function resetForm() {
  editingCaseId.value = null
  fillForm({})
  errorMessage.value = ''
  successMessage.value = ''
}

function editCase(item) {
  editingCaseId.value = item.id
  fillForm({
    title: item.title || '',
    logoMediaId: item.logoMediaId ?? '',
    summary: item.summary || '',
    keywordsText: Array.isArray(item.keywords) ? item.keywords.join('，') : '',
    visible: item.visible ?? true,
    status: item.status || 'DRAFT',
    version: item.version ?? 0,
  })
  errorMessage.value = ''
  successMessage.value = ''
}

function buildPayload() {
  return {
    title: form.title,
    logoMediaId: toNumberOrNull(form.logoMediaId),
    summary: form.summary,
    keywords: parseKeywords(form.keywordsText),
    visible: Boolean(form.visible),
    status: form.status,
  }
}

function validateForm(payload) {
  if (!payload.title) return '项目标题不能为空'
  if (!payload.logoMediaId) return '封面媒体 ID 不能为空'
  if (!payload.summary) return '成效摘要不能为空'
  if (payload.keywords.length > 10) return '关键词最多 10 个'
  if (new Set(payload.keywords).size !== payload.keywords.length) return '关键词不能重复'
  if (payload.keywords.some((keyword) => keyword.length > 30)) return '单个关键词最长 30 字符'
  return ''
}

async function loadCases() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getAdminCases({ pageNo: 1, pageSize })
    cases.value = Array.isArray(data.list) ? data.list : []
    page.total = Number(data.total || 0)
    page.pageNo = data.pageNo || 1
    page.pageSize = data.pageSize || pageSize
  } catch (error) {
    errorMessage.value = error?.message || '读取案例列表失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  const payload = buildPayload()
  const validationMessage = validateForm(payload)

  if (validationMessage) {
    errorMessage.value = validationMessage
    return
  }

  saving.value = true

  try {
    if (editingCaseId.value) {
      const list = await updateAdminCase(editingCaseId.value, {
        ...payload,
        version: form.version,
      })
      applyCaseList(list)
      successMessage.value = '案例已更新'
    } else {
      const list = await createAdminCase(payload)
      applyCaseList(list)
      successMessage.value = '案例已新增'
    }

    resetForm()
    await loadCases()
  } catch (error) {
    errorMessage.value = error?.message || '保存案例失败'
  } finally {
    saving.value = false
  }
}

async function handleDelete(item) {
  if (!window.confirm(`确认删除案例「${item.title}」？`)) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const list = await deleteAdminCase(item.id, item.version)
    applyCaseList(list)
    successMessage.value = '案例已删除'
    await loadCases()
  } catch (error) {
    errorMessage.value = error?.message || '删除案例失败'
  }
}

function moveCase(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= cases.value.length) return

  const next = [...cases.value]
  const [item] = next.splice(index, 1)
  next.splice(targetIndex, 0, item)
  cases.value = next
}

async function handleSaveSort() {
  if (!canSaveSort.value) return

  sortSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const list = await reorderAdminCases(cases.value.map((item) => item.id))
    applyCaseList(list)
    successMessage.value = '排序已保存'
    await loadCases()
  } catch (error) {
    errorMessage.value = error?.message || '保存排序失败'
  } finally {
    sortSaving.value = false
  }
}

async function changeCaseStatus(item, status) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateAdminCaseStatus(item.id, status, item.version)
    successMessage.value = `案例已${statusLabel(status)}`
    await loadCases()
  } catch (error) {
    errorMessage.value = error?.message || '更新发布状态失败'
  }
}

function statusLabel(status) {
  const labels = {
    DRAFT: '草稿',
    PUBLISHED: '发布',
    OFFLINE: '下线',
  }
  return labels[status] || status || '-'
}

function statusClass(status) {
  return String(status || 'DRAFT').toLowerCase()
}

onMounted(loadCases)
</script>

<style scoped>
.case-manage {
  display: grid;
  gap: 18px;
}

.case-manage__toolbar,
.case-manage__form,
.case-manage__list {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.case-manage__toolbar,
.case-manage__list header,
.case-manage__form header,
.case-manage__form-actions,
.case-manage__toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.case-manage h2,
.case-manage h3,
.case-manage p {
  margin: 0;
}

.case-manage h2 {
  color: #111827;
  font-size: 22px;
}

.case-manage h3 {
  color: #111827;
  font-size: 18px;
}

.case-manage p,
.case-manage header span {
  margin-top: 8px;
  color: #64748b;
}

.case-manage__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.case-manage__wide {
  grid-column: 1 / -1;
}

.case-manage label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.case-manage input,
.case-manage textarea,
.case-manage select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.case-manage input,
.case-manage select {
  height: 38px;
  padding: 0 10px;
}

.case-manage textarea {
  min-height: 92px;
  padding: 10px;
  resize: vertical;
}

.case-manage__form-actions {
  margin-top: 18px;
}

.case-manage a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.case-manage button {
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

.case-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.case-manage button.is-danger {
  background: #dc2626;
}

.case-manage table {
  width: 100%;
  margin-top: 18px;
  border-collapse: collapse;
}

.case-manage th,
.case-manage td {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.case-manage th {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.case-manage td strong,
.case-manage td small {
  display: block;
}

.case-manage td small {
  margin-top: 5px;
  color: #64748b;
}

.case-manage td img {
  display: block;
  width: 64px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  object-fit: contain;
}

.case-manage__order {
  display: flex;
  gap: 6px;
}

.case-manage__order button {
  min-height: 28px;
  padding: 0 8px;
  background: #475569;
  font-size: 12px;
}

.case-manage__tag,
.case-manage__status {
  display: inline-block;
  width: max-content;
  margin: 0 6px 6px 0;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.case-manage__tag {
  background: #e0f2fe;
  color: #0369a1;
}

.case-manage__status {
  background: #fee2e2;
  color: #b91c1c;
}

.case-manage__status.is-visible {
  background: #dcfce7;
  color: #047857;
}

.case-manage__content-status {
  display: inline-block;
  width: max-content;
  margin: 0 6px 6px 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 900;
}

.case-manage__content-status.draft {
  background: #fef3c7;
  color: #92400e;
}

.case-manage__content-status.published {
  background: #dcfce7;
  color: #166534;
}

.case-manage__content-status.offline {
  background: #e2e8f0;
  color: #475569;
}

.case-manage__empty,
.case-manage__hint {
  margin-top: 18px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
}

.case-manage__error,
.case-manage__success {
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.case-manage__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.case-manage__success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}

@media (max-width: 980px) {
  .case-manage__toolbar,
  .case-manage__list header,
  .case-manage__form header,
  .case-manage__form-actions,
  .case-manage__toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .case-manage__grid {
    grid-template-columns: 1fr;
  }

  .case-manage table {
    display: block;
    overflow-x: auto;
  }
}
</style>
