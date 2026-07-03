<template>
  <section class="site-module">
    <header class="site-module__header">
      <div>
        <p>{{ formConfig ? '内容运营' : 'Site Module' }}</p>
        <h2>{{ currentConfig?.title || '未找到模块' }}{{ formConfig ? '管理' : '' }}</h2>
      </div>
      <select v-model="selectedKey" @change="goSelectedModule">
        <option v-for="item in adminSiteModuleConfigs" :key="item.key" :value="item.key">
          {{ item.title }}
        </option>
      </select>
    </header>

    <p v-if="!currentConfig" class="site-module__error">当前后台模块不存在。</p>

    <template v-else-if="formConfig">
      <div class="site-module__toolbar">
        <div class="site-module__toolbar-actions">
          <button v-if="formConfig.api.create" type="button" :disabled="loading" @click="openCreateForm">
            新增 {{ formConfig.title }}
          </button>
          <button type="button" class="site-module__ghost-button" :disabled="loading" @click="loadData">
            {{ loading ? '刷新中...' : '刷新' }}
          </button>
        </div>
        <span>按配置表单管理</span>
      </div>

      <p v-if="message" class="site-module__message">{{ message }}</p>
      <p v-if="errorMessage" class="site-module__error">{{ errorMessage }}</p>

      <SiteModuleList
        :config="formConfig"
        :list-data="rows"
        :loading="saving || loading"
        @edit="openEditForm"
        @delete="deleteManagedItem"
        @toggle-visibility="toggleManagedVisibility"
        @reorder="reorderManagedItems"
      />

      <SiteModuleForm
        v-if="dialogOpen"
        :config="formConfig"
        :form-data="dialogFormData"
        :mode="dialogMode"
        :saving="saving"
        @submit="saveManagedForm"
        @cancel="closeDialog"
      />
    </template>

    <template v-else>
      <div class="site-module__toolbar">
        <button type="button" :disabled="loading" @click="loadData">
          {{ loading ? '刷新中...' : '刷新数据' }}
        </button>
        <span>{{ currentConfig.listPath }}</span>
      </div>

      <p v-if="message" class="site-module__message">{{ message }}</p>
      <p v-if="errorMessage" class="site-module__error">{{ errorMessage }}</p>

      <div class="site-module__grid">
        <article class="site-module__panel">
          <h3>接口数据</h3>
          <div v-if="rows.length" class="site-module__list">
            <button
              v-for="(row, index) in rows"
              :key="rowKey(row, index)"
              type="button"
              :class="{ active: selectedRow === row }"
              @click="selectRow(row)"
            >
              <strong>{{ rowTitle(row, index) }}</strong>
              <small>ID: {{ rowId(row) || '-' }} / version: {{ rowVersion(row) || '-' }}</small>
            </button>
          </div>
          <pre v-else>{{ prettyData }}</pre>
        </article>

        <article class="site-module__panel">
          <h3>写操作 JSON</h3>
          <label>
            记录 ID
            <input v-model.trim="form.id" placeholder="编辑/删除时填写，点击左侧记录可自动带入" />
          </label>
          <label>
            JSON Payload
            <textarea v-model="form.payload" spellcheck="false" />
          </label>
          <div class="site-module__actions">
            <button type="button" :disabled="saving || !currentConfig.createPath" @click="createItem">新增</button>
            <button type="button" :disabled="saving || !currentConfig.updatePath" @click="updateItem">保存编辑</button>
            <button type="button" :disabled="saving || !currentConfig.deletePath" @click="deleteItem">删除</button>
          </div>
        </article>

        <article class="site-module__panel">
          <h3>排序 / 可见性</h3>
          <label>
            排序 Payload
            <textarea v-model="form.reorderPayload" spellcheck="false" />
          </label>
          <button type="button" :disabled="saving || !currentConfig.reorderPath" @click="reorderItems">提交排序</button>

          <label>
            可见性 Payload
            <textarea v-model="form.visibilityPayload" spellcheck="false" />
          </label>
          <button type="button" :disabled="saving || !currentConfig.visibilityPath" @click="updateVisibility">
            更新可见性
          </button>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http, { unwrapApiData } from '../../api/http'
import SiteModuleForm from '../components/SiteModuleForm.vue'
import SiteModuleList from '../components/SiteModuleList.vue'
import { getSiteModuleFormConfig, type SiteModuleFormConfig } from '../config/adminSiteModuleFormConfig'
import { requestAdminWithCsrf } from '../api/adminAuth'
import {
  adminSiteModuleConfigs,
  createAdminSiteModuleItem,
  deleteAdminSiteModuleItem,
  getAdminSiteModuleConfig,
  getAdminSiteModuleData,
  reorderAdminSiteModule,
  updateAdminSiteModuleItem,
  updateAdminSiteModuleVisibility,
} from '../api/adminSite'

const route = useRoute()
const router = useRouter()
const selectedKey = ref(String(route.params.moduleKey || adminSiteModuleConfigs[0]?.key || ''))
const rawData = ref<unknown>(null)
const selectedRow = ref<Record<string, unknown> | null>(null)
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogFormData = ref<Record<string, unknown>>({})
const form = reactive({
  id: '',
  payload: '{}',
  reorderPayload: '[]',
  visibilityPayload: '{\n  "visible": true,\n  "version": 0\n}',
})

const currentConfig = computed(() => getAdminSiteModuleConfig(selectedKey.value))
const formConfig = computed(() => getSiteModuleFormConfig(selectedKey.value))

const rows = computed(() => {
  const data = rawData.value
  if (formConfig.value?.listMode === 'singleton') return isRecord(data) ? [data] : []
  if (formConfig.value?.listMode === 'tree-items') {
    const categories = Array.isArray(data) ? data.filter(isRecord) : []
    return categories.flatMap((category) => {
      const items = Array.isArray(category.items) ? category.items.filter(isRecord) : []
      return items.map((item) => ({ ...item, categoryId: item.categoryId ?? category.id }))
    })
  }
  if (Array.isArray(data)) return data.filter(isRecord)
  if (isRecord(data) && Array.isArray(data.list)) return data.list.filter(isRecord)
  if (isRecord(data) && Array.isArray(data.records)) return data.records.filter(isRecord)
  return []
})

const prettyData = computed(() => JSON.stringify(rawData.value ?? {}, null, 2))

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseJson(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return {}
  return JSON.parse(trimmed)
}

function replaceId(path: string, id: string | number) {
  return path.replace('{id}', encodeURIComponent(String(id)))
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

function rowId(row: Record<string, unknown>, config = currentConfig.value) {
  const idField = config?.idField
  return String((idField && row[idField]) || row.id || row.menuId || row.metricId || row.clientLogoId || row.honorId || '')
}

function managedRowId(row: Record<string, unknown>, config: SiteModuleFormConfig) {
  return String(row[config.idField] || row.id || '')
}

function rowVersion(row: Record<string, unknown>) {
  const versionField = currentConfig.value?.versionField || 'version'
  return row[versionField]
}

function managedRowVersion(row: Record<string, unknown>, config: SiteModuleFormConfig) {
  return row[config.versionField] ?? 0
}

function rowTitle(row: Record<string, unknown>, index: number) {
  return String(
    row.title ||
      row.name ||
      row.menuName ||
      row.label ||
      row.siteTitle ||
      row.mainTitle ||
      row.tagText ||
      row.content ||
      `第 ${index + 1} 条`,
  )
}

function rowKey(row: Record<string, unknown>, index: number) {
  return rowId(row) || `${selectedKey.value}-${index}`
}

function friendlyErrorMessage(error: unknown, fallback: string) {
  const messageText = error instanceof Error ? error.message : ''
  if (/network|timeout|axios|err_network/i.test(messageText)) return '网络异常，请联系管理员'
  if (/exception|stacktrace|java\.|org\.springframework/i.test(messageText)) return fallback
  if (messageText && /[\u4e00-\u9fff]/.test(messageText)) return messageText
  return fallback
}

function createFormData(config: SiteModuleFormConfig, row?: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  config.fields.forEach((field) => {
    if (row) {
      data[field.key] = field.valueFromRow ? field.valueFromRow(row) : row[field.key]
      return
    }
    if (field.key === 'sortOrder') {
      data[field.key] = rows.value.length + 1
      return
    }
    if (field.key === 'year') {
      data[field.key] = new Date().getFullYear()
      return
    }
    data[field.key] = field.defaultValue ?? (field.type === 'switch' ? true : '')
  })

  if (row) {
    data[config.idField] = managedRowId(row, config)
    data[config.versionField] = managedRowVersion(row, config)
  } else {
    data[config.versionField] = 0
  }

  return data
}

function buildPayloadFromData(config: SiteModuleFormConfig, data: Record<string, unknown>, includeVersion: boolean) {
  const payload: Record<string, unknown> = {}
  config.fields.forEach((field) => {
    if (field.submit === false) return
    const value = data[field.key]
    if (field.required && (value === '' || value === null || value === undefined)) {
      throw new Error(`请填写${field.label}`)
    }
    payload[field.key] = field.submitValue ? field.submitValue(value) : value === '' ? null : value
  })
  if (includeVersion) payload[config.versionField] = data[config.versionField] ?? 0
  return payload
}

function syncSelectedKeyFromRoute() {
  const key = String(route.params.moduleKey || selectedKey.value)
  selectedKey.value = getAdminSiteModuleConfig(key) ? key : adminSiteModuleConfigs[0]?.key || ''
}

function goSelectedModule() {
  void router.push(`/admin/site-modules/${selectedKey.value}`)
}

function closeDialog() {
  dialogOpen.value = false
}

function openCreateForm() {
  if (!formConfig.value) return
  message.value = ''
  errorMessage.value = ''
  dialogMode.value = 'create'
  dialogFormData.value = createFormData(formConfig.value)
  dialogOpen.value = true
}

function openEditForm(row: Record<string, unknown>) {
  if (!formConfig.value) return
  message.value = ''
  errorMessage.value = ''
  dialogMode.value = 'edit'
  dialogFormData.value = createFormData(formConfig.value, row)
  dialogOpen.value = true
}

async function loadData() {
  if (!currentConfig.value) return
  loading.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    if (formConfig.value) {
      const response = await http.get(formConfig.value.api.list, { params: { pageNo: 1, pageSize: 200 } })
      rawData.value = unwrapApiData<unknown>(response.data)
    } else {
      rawData.value = await getAdminSiteModuleData(currentConfig.value)
    }
    selectedRow.value = null
    form.id = ''
    form.payload = currentConfig.value.singleton ? JSON.stringify(rawData.value ?? {}, null, 2) : '{}'
  } catch (error) {
    errorMessage.value = friendlyErrorMessage(error, '网络异常，请联系管理员')
  } finally {
    loading.value = false
  }
}

async function mutate(action: () => Promise<unknown>, successText: string, failureText = '操作失败') {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await action()
    message.value = successText
    await loadData()
    return true
  } catch (error) {
    errorMessage.value = friendlyErrorMessage(error, failureText)
    return false
  } finally {
    saving.value = false
  }
}

async function saveManagedForm(payload: Record<string, unknown>) {
  const config = formConfig.value
  if (!config) return

  const success =
    dialogMode.value === 'create'
      ? !config.api.create
        ? false
        : await mutate(() => requestAdminWithCsrf('post', config.api.create!, payload), '新增成功', '保存失败，请稍后重试')
      : !config.api.update
        ? false
        : await mutate(
            () =>
              requestAdminWithCsrf(
                'put',
                replaceId(config.api.update!, String(dialogFormData.value[config.idField] || '')),
                payload,
              ),
            '保存成功',
            '保存失败，请稍后重试',
          )
  if (success) closeDialog()
}

async function deleteManagedItem(row: Record<string, unknown>) {
  const config = formConfig.value
  if (!config || !config.api.delete) return
  const id = managedRowId(row, config)
  if (!id) {
    errorMessage.value = `未找到要删除的${config.title}`
    return
  }
  if (!window.confirm(`确认删除“${rowTitle(row, 0)}”？`)) return

  let path = replaceId(config.api.delete, id)
  if (config.delete.mode === 'query') {
    path = `${path}?version=${encodeURIComponent(String(managedRowVersion(row, config)))}`
    await mutate(() => requestAdminWithCsrf('delete', path), '删除成功', '删除失败，请检查数据状态')
    return
  }
  await mutate(
    () => requestAdminWithCsrf('delete', path, { [config.versionField]: managedRowVersion(row, config) }),
    '删除成功',
    '删除失败，请检查数据状态',
  )
}

async function toggleManagedVisibility(row: Record<string, unknown>) {
  const config = formConfig.value
  if (!config || !config.visibility.enabled || !config.api.update) return
  const data = createFormData(config, row)
  data[config.visibility.field] = row[config.visibility.field] === false
  await mutate(
    () => requestAdminWithCsrf('put', replaceId(config.api.update, managedRowId(row, config)), buildPayloadFromData(config, data, true)),
    data[config.visibility.field] ? '已显示' : '已隐藏',
    '保存失败，请稍后重试',
  )
}

async function reorderManagedItems(index: number, direction: -1 | 1) {
  const config = formConfig.value
  if (!config || !config.reorder.enabled || !config.reorder.path || !config.reorder.method) return
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= rows.value.length) return

  const orderedRows = [...rows.value]
  ;[orderedRows[index], orderedRows[nextIndex]] = [orderedRows[nextIndex], orderedRows[index]]
  const payload =
    config.reorder.mode === 'ordered-ids'
      ? { [config.reorder.orderedIdsField || 'orderedIds']: orderedRows.map((item) => toNumber(managedRowId(item, config))) }
      : orderedRows.map((item, sortIndex) => ({
          id: toNumber(managedRowId(item, config)),
          [config.reorder.sortField || 'sortOrder']: sortIndex + 1,
        }))

  await mutate(
    () => requestAdminWithCsrf(config.reorder.method, config.reorder.path, payload),
    '排序成功',
    '保存失败，请稍后重试',
  )
}

function selectRow(row: Record<string, unknown>) {
  selectedRow.value = row
  form.id = rowId(row)
  form.payload = JSON.stringify(row, null, 2)
  const version = rowVersion(row) ?? 0
  form.visibilityPayload = JSON.stringify({ visible: row.visible ?? true, version }, null, 2)
}

async function createItem() {
  if (!currentConfig.value) return
  await mutate(() => createAdminSiteModuleItem(currentConfig.value!, parseJson(form.payload)), '新增成功')
}

async function updateItem() {
  if (!currentConfig.value) return
  await mutate(
    () => updateAdminSiteModuleItem(currentConfig.value!, form.id || null, parseJson(form.payload)),
    '保存成功',
  )
}

async function deleteItem() {
  if (!currentConfig.value || !form.id) {
    errorMessage.value = '请先填写记录 ID'
    return
  }
  await mutate(() => deleteAdminSiteModuleItem(currentConfig.value!, form.id, parseJson(form.payload)), '删除成功')
}

async function reorderItems() {
  if (!currentConfig.value) return
  await mutate(() => reorderAdminSiteModule(currentConfig.value!, parseJson(form.reorderPayload)), '排序成功')
}

async function updateVisibility() {
  if (!currentConfig.value || !form.id) {
    errorMessage.value = '请先填写记录 ID'
    return
  }
  await mutate(
    () => updateAdminSiteModuleVisibility(currentConfig.value!, form.id, parseJson(form.visibilityPayload)),
    '可见性已更新',
  )
}

watch(
  () => route.params.moduleKey,
  () => {
    syncSelectedKeyFromRoute()
    closeDialog()
    void loadData()
  },
)

onMounted(() => {
  syncSelectedKeyFromRoute()
  void loadData()
})
</script>

<style scoped>
.site-module {
  display: grid;
  gap: 18px;
  color: #1f2937;
}

.site-module__header,
.site-module__toolbar,
.site-module__panel {
  border: 1px solid #d9dee6;
  border-radius: 8px;
  background: #fff;
}

.site-module__header,
.site-module__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
}

.site-module__header p {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.site-module__header h2,
.site-module__panel h3 {
  margin: 0;
}

.site-module__header select,
.site-module input,
.site-module textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
}

.site-module__header select {
  max-width: 260px;
  height: 40px;
  padding: 0 10px;
}

.site-module__toolbar span {
  color: #64748b;
  font-size: 13px;
}

.site-module__toolbar-actions,
.site-module__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.site-module__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr) minmax(280px, 0.7fr);
  gap: 18px;
}

.site-module__panel {
  display: grid;
  gap: 14px;
  align-content: start;
  padding: 18px;
}

.site-module__list {
  display: grid;
  gap: 8px;
  max-height: 520px;
  overflow: auto;
}

.site-module__list button {
  display: grid;
  gap: 4px;
  justify-items: start;
  min-height: 58px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  color: inherit;
  text-align: left;
}

.site-module__list button.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.site-module__list small {
  color: #64748b;
}

.site-module label {
  display: grid;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.site-module input {
  height: 38px;
  padding: 0 10px;
}

.site-module textarea {
  min-height: 120px;
  padding: 10px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
}

.site-module pre {
  max-height: 520px;
  overflow: auto;
  margin: 0;
  padding: 12px;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.55;
}

.site-module button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.site-module button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.site-module__ghost-button {
  border: 1px solid #cbd5e1 !important;
  background: #fff !important;
  color: #334155 !important;
}

.site-module__message,
.site-module__error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 6px;
  font-weight: 700;
}

.site-module__message {
  background: #ecfdf5;
  color: #047857;
}

.site-module__error {
  background: #fef2f2;
  color: #b91c1c;
}

@media (max-width: 1180px) {
  .site-module__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .site-module__header,
  .site-module__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .site-module__header select {
    max-width: none;
  }
}
</style>
