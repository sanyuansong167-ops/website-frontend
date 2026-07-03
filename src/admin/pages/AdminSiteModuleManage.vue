<template>
  <section class="site-module">
    <header class="site-module__header">
      <div>
        <p>Site Module</p>
        <h2>{{ currentConfig?.title || '未找到模块' }}</h2>
      </div>
      <select v-model="selectedKey" @change="goSelectedModule">
        <option v-for="item in adminSiteModuleConfigs" :key="item.key" :value="item.key">
          {{ item.title }}
        </option>
      </select>
    </header>

    <p v-if="!currentConfig" class="site-module__error">当前后台模块不存在。</p>

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
const form = reactive({
  id: '',
  payload: '{}',
  reorderPayload: '[]',
  visibilityPayload: '{\n  "visible": true,\n  "version": 0\n}',
})

const currentConfig = computed(() => getAdminSiteModuleConfig(selectedKey.value))

const rows = computed(() => {
  const data = rawData.value
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

function rowId(row: Record<string, unknown>) {
  const idField = currentConfig.value?.idField
  return String((idField && row[idField]) || row.id || row.menuId || row.metricId || row.clientLogoId || row.honorId || '')
}

function rowVersion(row: Record<string, unknown>) {
  const versionField = currentConfig.value?.versionField || 'version'
  return row[versionField]
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

function selectRow(row: Record<string, unknown>) {
  selectedRow.value = row
  form.id = rowId(row)
  form.payload = JSON.stringify(row, null, 2)
  const version = rowVersion(row) ?? 0
  form.visibilityPayload = JSON.stringify({ visible: row.visible ?? true, version }, null, 2)
}

function syncSelectedKeyFromRoute() {
  const key = String(route.params.moduleKey || selectedKey.value)
  selectedKey.value = getAdminSiteModuleConfig(key) ? key : adminSiteModuleConfigs[0]?.key || ''
}

function goSelectedModule() {
  void router.push(`/admin/site-modules/${selectedKey.value}`)
}

async function loadData() {
  if (!currentConfig.value) return
  loading.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    rawData.value = await getAdminSiteModuleData(currentConfig.value)
    selectedRow.value = null
    form.id = ''
    form.payload = currentConfig.value.singleton ? JSON.stringify(rawData.value ?? {}, null, 2) : '{}'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function mutate(action: () => Promise<unknown>, successText: string) {
  saving.value = true
  message.value = ''
  errorMessage.value = ''

  try {
    await action()
    message.value = successText
    await loadData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '操作失败'
  } finally {
    saving.value = false
  }
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
  text-transform: uppercase;
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
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
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
  min-height: 220px;
  padding: 10px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 13px;
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

.site-module__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
</style>
