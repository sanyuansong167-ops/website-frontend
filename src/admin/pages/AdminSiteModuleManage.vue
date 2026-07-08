<template>
  <section class="site-module">
    <header class="site-module__header">
      <div>
        <p>{{ formConfig ? '内容运营' : 'Site Module' }}</p>
        <h2>{{ currentConfig?.title || '未找到模块' }}{{ formConfig ? '管理' : '' }}</h2>
      </div>
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

      <div v-if="isPhase2EnhancedModule" class="site-module__ops">
        <label>
          搜索
          <input v-model.trim="aiFilters.keyword" :placeholder="opsSearchPlaceholder" @input="clearAiSelection" />
        </label>
        <label>
          显示状态
          <select v-model="aiFilters.visible" @change="clearAiSelection">
            <option value="">全部</option>
            <option value="visible">显示</option>
            <option value="hidden">隐藏</option>
          </select>
        </label>
        <div class="site-module__batch-actions">
          <button type="button" :disabled="batchBusy || !selectedAiRows.length" @click="batchSetAiVisible(true)">
            {{ batchBusy ? '处理中...' : '批量显示' }}
          </button>
          <button type="button" :disabled="batchBusy || !selectedAiRows.length" @click="batchSetAiVisible(false)">
            批量隐藏
          </button>
          <button type="button" class="site-module__danger-button" :disabled="batchBusy || !selectedAiRows.length" @click="batchDeleteAiCards">
            批量删除
          </button>
          <button type="button" class="site-module__ghost-button" :disabled="batchBusy || !selectedAiRows.length" @click="clearAiSelection">
            清空选择
          </button>
        </div>
        <small>已选择 {{ selectedAiRows.length }} 条</small>
      </div>

      <div v-if="inlineEdit.active" class="site-module__inline-editor">
        <label>
          {{ inlineEdit.field === 'sortOrder' ? '排序' : '名称' }}
          <input
            v-model="inlineEdit.value"
            :type="inlineEdit.field === 'sortOrder' ? 'number' : 'text'"
            :disabled="inlineEdit.saving"
            @keyup.enter="scheduleInlineSave"
            @blur="scheduleInlineSave"
          />
        </label>
        <span>{{ inlineEdit.saving ? 'Saving...' : '按 Enter 或移出输入框保存' }}</span>
      </div>

      <p v-if="message" class="site-module__message">{{ message }}</p>
      <p v-if="errorMessage" class="site-module__error">{{ errorMessage }}</p>

      <SiteModuleList
        :config="formConfig"
        :list-data="displayRows"
        :loading="saving || loading || batchBusy || inlineEdit.saving"
        :selectable="isPhase2EnhancedModule"
        :selected-ids="selectedAiIds"
        :inline-editable="isPhase2EnhancedModule"
        :inline-fields="inlineEditableFields"
        @edit="openEditForm"
        @delete="deleteManagedItem"
        @toggle-visibility="toggleManagedVisibility"
        @reorder="reorderManagedItems"
        @select-row="toggleAiSelection"
        @select-all="toggleAllAiSelection"
        @inline-start="startInlineEdit"
        @custom-action="handleManagedCustomAction"
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
import { useRoute } from 'vue-router'
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
const selectedAiIds = ref<string[]>([])
const batchBusy = ref(false)
let inlineSaveTimer: ReturnType<typeof setTimeout> | null = null
const aiFilters = reactive({
  keyword: '',
  visible: '',
})
const inlineEdit = reactive({
  active: false,
  saving: false,
  row: null as Record<string, unknown> | null,
  field: '',
  value: '',
})
const form = reactive({
  id: '',
  payload: '{}',
  reorderPayload: '[]',
  visibilityPayload: '{\n  "visible": true,\n  "version": 0\n}',
})

const currentConfig = computed(() => getAdminSiteModuleConfig(selectedKey.value))
const formConfig = computed(() => getSiteModuleFormConfig(selectedKey.value))
const isAiCardsModule = computed(() => selectedKey.value === 'ai-cards')
const isClientLogosModule = computed(() => selectedKey.value === 'client-logos')
const isTimelineModule = computed(() => selectedKey.value === 'timeline-events')
const isCapabilityModule = computed(() => selectedKey.value === 'capability-categories' || selectedKey.value === 'capability-items')
const isStrengthMetricsModule = computed(() => selectedKey.value === 'strength-metrics')
const isPhase2EnhancedModule = computed(
  () =>
    isAiCardsModule.value ||
    isClientLogosModule.value ||
    isTimelineModule.value ||
    isCapabilityModule.value ||
    isStrengthMetricsModule.value,
)
const opsSearchPlaceholder = computed(() => {
  if (isClientLogosModule.value) return '输入客户名称或所属行业'
  if (isTimelineModule.value) return '输入年份、标题或描述'
  if (isCapabilityModule.value) return '输入分类、子项名称或分类 ID'
  if (isStrengthMetricsModule.value) return '输入核心数值或业务标签'
  return '输入名称、英文名或描述'
})
const inlineEditableFields = computed(() => {
  if (isTimelineModule.value) return ['title']
  if (isStrengthMetricsModule.value) return []
  return ['name', 'sortOrder']
})

const rows = computed(() => {
  const data = rawData.value
  if (formConfig.value?.listMode === 'singleton') return isRecord(data) ? [data] : []
  if (formConfig.value?.listMode === 'tree') return flattenTreeRows(Array.isArray(data) ? data.filter(isRecord) : [])
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

const displayRows = computed(() => {
  if (!isPhase2EnhancedModule.value) return rows.value
  const keyword = aiFilters.keyword.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesKeyword =
      !keyword ||
      String(row.name || '').toLowerCase().includes(keyword) ||
      String(row.industry || '').toLowerCase().includes(keyword) ||
      String(row.categoryId || '').toLowerCase().includes(keyword) ||
      String(row.year || '').toLowerCase().includes(keyword) ||
      String(row.title || '').toLowerCase().includes(keyword) ||
      String(row.metricValue || '').toLowerCase().includes(keyword) ||
      String(row.label || '').toLowerCase().includes(keyword) ||
      String(row.englishName || '').toLowerCase().includes(keyword) ||
      String(row.description || '').toLowerCase().includes(keyword)
    const visible = row.visible !== false
    const matchesVisible =
      !aiFilters.visible ||
      (aiFilters.visible === 'visible' && visible) ||
      (aiFilters.visible === 'hidden' && !visible)
    return matchesKeyword && matchesVisible
  })
})

const selectedAiRows = computed(() => rows.value.filter((row, index) => selectedAiIds.value.includes(selectionKey(row, index))))

const prettyData = computed(() => JSON.stringify(rawData.value ?? {}, null, 2))

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function flattenTreeRows(items: Record<string, unknown>[], level = 0): Record<string, unknown>[] {
  return items.flatMap((item) => {
    const children = Array.isArray(item.children) ? item.children.filter(isRecord) : []
    return [{ ...item, level }, ...flattenTreeRows(children, level + 1)]
  })
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
      row.pageName ||
      row.blockName ||
      row.label ||
      row.siteTitle ||
      row.mainTitle ||
      row.tagText ||
      row.treeName ||
      row.categoryName ||
      row.content ||
      `第 ${index + 1} 条`,
  )
}

function rowKey(row: Record<string, unknown>, index: number) {
  return rowId(row) || `${selectedKey.value}-${index}`
}

function selectionKey(row: Record<string, unknown>, index = rows.value.indexOf(row)) {
  return String(row[formConfig.value?.idField || 'id'] || row.id || `${selectedKey.value}-${index}`)
}

function clearAiSelection() {
  selectedAiIds.value = []
}

function toggleAiSelection(row: Record<string, unknown>, selected: boolean) {
  const key = selectionKey(row)
  selectedAiIds.value = selected
    ? Array.from(new Set([...selectedAiIds.value, key]))
    : selectedAiIds.value.filter((item) => item !== key)
}

function toggleAllAiSelection(selected: boolean) {
  selectedAiIds.value = selected ? displayRows.value.map((row, index) => selectionKey(row, index)) : []
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
    clearAiSelection()
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

function cleanAiPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function buildAiUpdatePayload(row: Record<string, unknown>, patch: Record<string, unknown>) {
  const config = formConfig.value
  if (!config) throw new Error('模块配置不存在')
  const data = createFormData(config, row)
  Object.assign(data, patch)
  return cleanAiPayload(buildPayloadFromData(config, data, true))
}

async function updateAiRow(row: Record<string, unknown>, patch: Record<string, unknown>) {
  const config = formConfig.value
  if (!config?.api.update) throw new Error('更新接口不存在')
  const id = managedRowId(row, config)
  if (!id) throw new Error('记录不存在')
  return requestAdminWithCsrf('put', replaceId(config.api.update, id), buildAiUpdatePayload(row, patch))
}

async function batchSetAiVisible(visible: boolean) {
  await runAiBatch(
    selectedAiRows.value,
    (row) => updateAiRow(row, { visible }),
    visible ? '显示' : '隐藏',
  )
}

async function batchDeleteAiCards() {
  const rowsToDelete = [...selectedAiRows.value]
  if (!rowsToDelete.length) return
  if (!window.confirm(`已选择 ${rowsToDelete.length} 条记录，是否确认删除？\n删除后无法恢复`)) return
  await runAiBatch(rowsToDelete, deleteAiRow, '删除')
}

async function deleteAiRow(row: Record<string, unknown>) {
  const config = formConfig.value
  if (!config?.api.delete) throw new Error('删除接口不存在')
  const id = managedRowId(row, config)
  if (!id) throw new Error('记录不存在')
  const path = `${replaceId(config.api.delete, id)}?version=${encodeURIComponent(String(managedRowVersion(row, config)))}`
  return requestAdminWithCsrf('delete', path)
}

async function runAiBatch(
  targetRows: Record<string, unknown>[],
  action: (row: Record<string, unknown>) => Promise<unknown>,
  actionLabel: string,
) {
  if (!targetRows.length) return
  batchBusy.value = true
  message.value = ''
  errorMessage.value = ''
  let successCount = 0
  let failureCount = 0

  for (const row of targetRows) {
    try {
      await action(row)
      successCount += 1
    } catch (error) {
      failureCount += 1
      console.warn(`[${currentConfig.value?.key || 'site-module'} batch operation failed]`, error)
    }
  }

  message.value = `${successCount} 条记录已${actionLabel}${failureCount ? `，失败 ${failureCount} 条` : ''}`
  if (failureCount) errorMessage.value = `失败 ${failureCount} 条，请稍后重试`
  clearAiSelection()
  batchBusy.value = false
  await loadData()
}

function startInlineEdit(row: Record<string, unknown>, field: string) {
  if (!isPhase2EnhancedModule.value || !inlineEditableFields.value.includes(field) || inlineEdit.saving) return
  inlineEdit.active = true
  inlineEdit.row = row
  inlineEdit.field = field
  inlineEdit.value = String(row[field] ?? '')
  errorMessage.value = ''
}

function scheduleInlineSave() {
  if (!inlineEdit.active || inlineEdit.saving) return
  if (inlineSaveTimer) clearTimeout(inlineSaveTimer)
  inlineSaveTimer = setTimeout(() => {
    void saveInlineEdit()
  }, 300)
}

async function saveInlineEdit() {
  if (!inlineEdit.row || !inlineEdit.field) return
  const field = inlineEdit.field
  const rawValue = inlineEdit.value.trim()
  const value = field === 'sortOrder' ? Number(rawValue) : rawValue
  if ((field === 'name' || field === 'title') && !rawValue) {
    errorMessage.value = '保存失败，请稍后重试'
    return
  }
  if (field === 'sortOrder' && !Number.isFinite(value)) {
    errorMessage.value = '保存失败，请稍后重试'
    return
  }

  inlineEdit.saving = true
  message.value = ''
  errorMessage.value = ''
  try {
    await updateAiRow(inlineEdit.row, { [field]: value })
    message.value = '保存成功'
    inlineEdit.active = false
    inlineEdit.row = null
    inlineEdit.field = ''
    inlineEdit.value = ''
    await loadData()
  } catch (error) {
    console.warn(`[${currentConfig.value?.key || 'site-module'} inline edit failed]`, error)
    errorMessage.value = '保存失败，请稍后重试'
  } finally {
    inlineEdit.saving = false
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
  const confirmText = isPhase2EnhancedModule.value
    ? `确认删除该内容？\n删除后无法恢复`
    : `确认删除“${rowTitle(row, 0)}”？`
  if (!window.confirm(confirmText)) return

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

async function handleManagedCustomAction(actionKey: string, row: Record<string, unknown>) {
  if (selectedKey.value !== 'business-templates') return
  if (actionKey === 'copy-template') {
    await copyBusinessTemplate(row)
    return
  }
  if (actionKey === 'create-business-from-template') {
    await createBusinessFromTemplate(row)
  }
}

async function copyBusinessTemplate(row: Record<string, unknown>) {
  const config = formConfig.value
  if (!config) return
  const id = managedRowId(row, config)
  if (!id) {
    errorMessage.value = '未找到要复制的模板'
    return
  }
  if (!window.confirm(`确认复制模板“${rowTitle(row, 0)}”？`)) return
  const version = encodeURIComponent(String(managedRowVersion(row, config)))
  await mutate(
    () => requestAdminWithCsrf('post', `/admin/api/business-templates/${encodeURIComponent(id)}/copy?version=${version}`),
    '模板已复制',
    '复制模板失败，请稍后重试',
  )
}

async function createBusinessFromTemplate(row: Record<string, unknown>) {
  const config = formConfig.value
  if (!config) return
  const id = managedRowId(row, config)
  if (!id) {
    errorMessage.value = '未找到要使用的模板'
    return
  }
  const defaultCode = String(row.defaultBusinessCode || row.templateCode || '').trim()
  const businessCode = window.prompt('请输入新业务编码', defaultCode)
  if (businessCode === null) return
  const defaultName = String(row.defaultBusinessName || row.templateName || '').trim()
  const businessName = window.prompt('请输入新业务名称', defaultName)
  if (businessName === null) return
  await mutate(
    () =>
      requestAdminWithCsrf('post', `/admin/api/business-templates/${encodeURIComponent(id)}/create-business`, {
        businessCode: businessCode.trim(),
        businessName: businessName.trim(),
      }),
    '业务已创建',
    '从模板创建业务失败，请稍后重试',
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
    clearAiSelection()
    inlineEdit.active = false
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

.site-module input,
.site-module textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
}

.site-module__toolbar span {
  color: #64748b;
  font-size: 13px;
}

.site-module__toolbar-actions,
.site-module__actions,
.site-module__batch-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.site-module__ops,
.site-module__inline-editor {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid #d9dee6;
  border-radius: 8px;
  background: #fff;
}

.site-module__ops label,
.site-module__inline-editor label {
  display: grid;
  gap: 6px;
  min-width: 180px;
  color: #475569;
  font-size: 13px;
  font-weight: 800;
}

.site-module__ops select {
  width: 160px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
}

.site-module__ops small,
.site-module__inline-editor span {
  color: #64748b;
  font-size: 13px;
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

.site-module__danger-button {
  background: #dc2626 !important;
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
  .site-module__toolbar,
  .site-module__ops,
  .site-module__inline-editor {
    align-items: stretch;
    flex-direction: column;
  }

}
</style>
