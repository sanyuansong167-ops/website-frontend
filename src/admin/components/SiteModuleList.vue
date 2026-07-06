<template>
  <article class="site-module-list">
    <div class="site-module-list__header">
      <h3>{{ config.title }}列表</h3>
      <small>{{ loading ? '加载中...' : `共 ${listData.length} 条` }}</small>
    </div>

    <div class="site-module-list__table-wrap">
      <table class="site-module-list__table">
        <thead>
          <tr>
            <th v-if="selectable" class="site-module-list__select-col">
              <input type="checkbox" :checked="allSelected" :disabled="loading || !listData.length" @change="toggleAll" />
            </th>
            <th v-for="column in config.columns" :key="column.key">{{ column.label }}</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listData.length">
            <td :colspan="config.columns.length + 1 + (selectable ? 1 : 0)" class="site-module-list__empty">
              {{ config.emptyText }}
            </td>
          </tr>
          <tr v-for="(row, index) in listData" :key="rowKey(row, index)">
            <td v-if="selectable" class="site-module-list__select-col">
              <input
                type="checkbox"
                :checked="selectedIdsSafe.includes(rowKey(row, index))"
                :disabled="loading"
                @change="$emit('selectRow', row, !selectedIdsSafe.includes(rowKey(row, index)))"
              />
            </td>
            <td v-for="column in config.columns" :key="column.key" :class="cellClass(column.type)">
              <template v-if="column.type === 'media'">
                <div class="site-module-list__media">
                  <img v-if="mediaUrl(row, column.mediaKey || column.key)" :src="mediaUrl(row, column.mediaKey || column.key)" alt="" />
                  <span v-else>{{ mediaId(row, column.mediaKey || column.key) ? `#${mediaId(row, column.mediaKey || column.key)}` : '未设置' }}</span>
                </div>
              </template>
              <template v-else-if="column.type === 'switch'">
                <label v-if="config.visibility.enabled" class="site-module-list__switch">
                  <input
                    type="checkbox"
                    :checked="row[column.key] !== false"
                    :disabled="loading"
                    @change="$emit('toggleVisibility', row)"
                  />
                  <span>{{ row[column.key] === false ? '隐藏' : '显示' }}</span>
                </label>
                <span v-else>-</span>
              </template>
              <template v-else-if="column.type === 'date'">
                {{ formatDate(row[column.key]) }}
              </template>
              <template v-else-if="column.type === 'sort'">
                <span
                  v-if="inlineEditable && inlineFieldsSafe.includes(column.key)"
                  class="site-module-list__inline"
                  @click="$emit('inlineStart', row, column.key)"
                >
                  {{ row[column.key] ?? index + 1 }}
                </span>
                <span v-else>{{ row[column.key] ?? index + 1 }}</span>
              </template>
              <template v-else>
                <span
                  v-if="inlineEditable && inlineFieldsSafe.includes(column.key)"
                  class="site-module-list__inline"
                  @click="$emit('inlineStart', row, column.key)"
                >
                  {{ row[column.key] || '-' }}
                </span>
                <span v-else>{{ row[column.key] || '-' }}</span>
              </template>
            </td>
            <td>
              <div class="site-module-list__actions">
                <button v-if="config.api.update" type="button" @click="$emit('edit', row)">编辑</button>
                <button
                  v-if="config.reorder.enabled"
                  type="button"
                  :disabled="loading || index === 0"
                  @click="$emit('reorder', index, -1)"
                >
                  上移
                </button>
                <button
                  v-if="config.reorder.enabled"
                  type="button"
                  :disabled="loading || index === listData.length - 1"
                  @click="$emit('reorder', index, 1)"
                >
                  下移
                </button>
                <button
                  v-if="config.api.delete"
                  type="button"
                  class="site-module-list__danger"
                  :disabled="loading"
                  @click="$emit('delete', row)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SiteModuleColumnType, SiteModuleFormConfig } from '../config/adminSiteModuleFormConfig'

const props = defineProps<{
  config: SiteModuleFormConfig
  listData: Record<string, unknown>[]
  loading?: boolean
  selectable?: boolean
  selectedIds?: string[]
  inlineEditable?: boolean
  inlineFields?: string[]
}>()

const emit = defineEmits<{
  edit: [row: Record<string, unknown>]
  delete: [row: Record<string, unknown>]
  toggleVisibility: [row: Record<string, unknown>]
  reorder: [index: number, direction: -1 | 1]
  selectRow: [row: Record<string, unknown>, selected: boolean]
  selectAll: [selected: boolean]
  inlineStart: [row: Record<string, unknown>, field: string]
}>()

const selectedIdsSafe = computed(() => props.selectedIds || [])
const inlineFieldsSafe = computed(() => props.inlineFields || [])
const allSelected = computed(() => props.listData.length > 0 && props.listData.every((row, index) => selectedIdsSafe.value.includes(rowKey(row, index))))

function toggleAll() {
  emit('selectAll', !allSelected.value)
}

function rowKey(row: Record<string, unknown>, index: number) {
  return String(row[props.config.idField] || row.id || `${props.config.key}-${index}`)
}

function cellClass(type?: SiteModuleColumnType) {
  return {
    'site-module-list__description': type === 'description',
  }
}

function mediaObject(row: Record<string, unknown>, mediaKey: string) {
  const media = row[mediaKey]
  return media && typeof media === 'object' && !Array.isArray(media) ? (media as Record<string, unknown>) : null
}

function mediaId(row: Record<string, unknown>, mediaKey: string) {
  const media = mediaObject(row, mediaKey)
  return media?.id ?? row[`${mediaKey}Id`]
}

function mediaUrl(row: Record<string, unknown>, mediaKey: string) {
  const media = mediaObject(row, mediaKey)
  return String(media?.url || row[`${mediaKey}Url`] || '')
}

function formatDate(value: unknown) {
  if (!value) return '-'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.site-module-list {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid #d9dee6;
  border-radius: 8px;
  background: #fff;
}

.site-module-list__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.site-module-list__header h3 {
  margin: 0;
}

.site-module-list__header small {
  color: #64748b;
  font-size: 13px;
}

.site-module-list__table-wrap {
  overflow-x: auto;
}

.site-module-list__table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.site-module-list__table th,
.site-module-list__table td {
  padding: 12px 10px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

.site-module-list__table th {
  color: #475569;
  background: #f8fafc;
  font-size: 13px;
}

.site-module-list__select-col {
  width: 42px;
  text-align: center !important;
}

.site-module-list__empty {
  height: 120px;
  color: #64748b;
  text-align: center !important;
}

.site-module-list__description {
  max-width: 280px;
  color: #475569;
  line-height: 1.5;
}

.site-module-list__media {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  overflow: hidden;
}

.site-module-list__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.site-module-list__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.site-module-list__switch input,
.site-module-list__select-col input {
  width: 18px;
  height: 18px;
}

.site-module-list__inline {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 3px 6px;
  border-radius: 6px;
  cursor: text;
}

.site-module-list__inline:hover {
  background: #eff6ff;
  color: #1d4ed8;
}

.site-module-list__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.site-module-list button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.site-module-list button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.site-module-list__danger {
  background: #dc2626 !important;
}

@media (max-width: 720px) {
  .site-module-list__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
