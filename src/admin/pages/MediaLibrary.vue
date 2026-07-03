<template>
  <section class="media-library">
    <header class="media-library__header">
      <div>
        <p>内容运营</p>
        <h2>媒体库</h2>
      </div>
      <div class="media-library__upload">
        <input ref="fileInputRef" type="file" accept="image/*,application/pdf" @change="handleFileChange" />
        <button type="button" :disabled="uploading" title="上传媒体" @click="openFilePicker">
          <Upload :size="16" />
          <span>{{ uploading ? '上传中...' : '上传' }}</span>
        </button>
      </div>
    </header>

    <div class="media-library__filters">
      <label class="media-library__search">
        <Search :size="16" />
        <input v-model.trim="filters.keyword" placeholder="搜索文件名、URL、Alt 或备注" @keyup.enter="reloadFirstPage" />
      </label>
      <select v-model="filters.mediaType" @change="reloadFirstPage">
        <option value="">全部类型</option>
        <option value="IMAGE">图片</option>
        <option value="DOCUMENT">文档</option>
      </select>
      <select v-model="filters.usageTag" @change="reloadFirstPage">
        <option value="">全部用途</option>
        <option v-for="item in usageTags" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <select v-model="filters.status" @change="reloadFirstPage">
        <option value="ACTIVE">启用</option>
        <option value="DELETED">已删除</option>
        <option value="">全部状态</option>
      </select>
      <button type="button" class="media-library__ghost" :disabled="loading" title="刷新" @click="loadMedia">
        <RefreshCw :size="16" />
      </button>
    </div>

    <p v-if="message" class="media-library__message">{{ message }}</p>
    <p v-if="errorMessage" class="media-library__error">{{ errorMessage }}</p>

    <div class="media-library__table">
      <table>
        <thead>
          <tr>
            <th>预览</th>
            <th>媒体信息</th>
            <th>用途</th>
            <th>Alt / 备注</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && mediaList.length === 0">
            <td colspan="6" class="media-library__empty">暂无媒体</td>
          </tr>
          <tr v-for="item in mediaList" :key="item.id">
            <td>
              <img v-if="isImage(item)" class="media-library__thumb" :src="mediaUrl(item)" :alt="item.altText || ''" />
              <span v-else class="media-library__doc">DOC</span>
            </td>
            <td>
              <strong>{{ item.originalFilename }}</strong>
              <small>ID: {{ item.id }} / {{ item.mediaType }} / {{ formatFileSize(item.fileSize) }}</small>
              <code>{{ item.publicUrl }}</code>
            </td>
            <td>{{ usageLabel(item.usageTag) }}</td>
            <td>
              <span>{{ item.altText || '-' }}</span>
              <small>{{ item.remark || '-' }}</small>
            </td>
            <td>
              <span :class="['media-library__status', item.status === 'DELETED' ? 'deleted' : 'active']">
                {{ item.status === 'DELETED' ? '已删除' : '启用' }}
              </span>
            </td>
            <td>
              <div class="media-library__actions">
                <button type="button" title="复制 URL" @click="copyUrl(item)">
                  <Copy :size="15" />
                </button>
                <button type="button" title="编辑" :disabled="item.status === 'DELETED'" @click="openEdit(item)">
                  <Pencil :size="15" />
                </button>
                <button type="button" title="删除" :disabled="item.status === 'DELETED'" @click="deleteMedia(item)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="media-library__empty">加载中...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="media-library__pagination">
      <span>共 {{ total }} 条，第 {{ page }} 页</span>
      <div>
        <button type="button" :disabled="page <= 1 || loading" title="上一页" @click="changePage(page - 1)">
          <ChevronLeft :size="16" />
        </button>
        <button type="button" :disabled="page >= totalPages || loading" title="下一页" @click="changePage(page + 1)">
          <ChevronRight :size="16" />
        </button>
      </div>
    </footer>

    <div v-if="editing" class="media-library__modal" role="dialog" aria-modal="true">
      <form class="media-library__dialog" @submit.prevent="saveEdit">
        <header>
          <h3>编辑媒体</h3>
          <button type="button" title="关闭" @click="closeEdit">
            <X :size="18" />
          </button>
        </header>
        <label>
          用途
          <select v-model="editForm.usageTag">
            <option v-for="item in usageTags" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <label>
          Alt 文本
          <input v-model.trim="editForm.altText" maxlength="255" />
        </label>
        <label>
          备注
          <textarea v-model.trim="editForm.remark" maxlength="500" />
        </label>
        <footer>
          <button type="button" class="media-library__ghost" @click="closeEdit">取消</button>
          <button type="submit" :disabled="saving">保存</button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ChevronLeft, ChevronRight, Copy, Pencil, RefreshCw, Search, Trash2, Upload, X } from 'lucide-vue-next'
import {
  deleteAdminMedia,
  listAdminMedia,
  type AdminMediaAsset,
  updateAdminMedia,
  uploadAdminMedia,
} from '../api/adminMedia'

const usageTags = [
  { value: 'LOGO', label: 'Logo' },
  { value: 'BANNER', label: 'Banner' },
  { value: 'PRODUCT', label: '产品' },
  { value: 'CASE', label: '案例' },
  { value: 'CLIENT', label: '客户' },
  { value: 'HONOR', label: '荣誉' },
  { value: 'ICON', label: '图标' },
  { value: 'OTHER', label: '其他' },
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const mediaList = ref<AdminMediaAsset[]>([])
const loading = ref(false)
const uploading = ref(false)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const editing = ref<AdminMediaAsset | null>(null)
const filters = reactive({
  keyword: '',
  mediaType: '',
  usageTag: '',
  status: 'ACTIVE',
})
const editForm = reactive({
  usageTag: 'OTHER',
  altText: '',
  remark: '',
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

onMounted(loadMedia)

function openFilePicker() {
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  message.value = ''
  errorMessage.value = ''
  try {
    await uploadAdminMedia(file)
    message.value = '上传成功'
    input.value = ''
    await reloadFirstPage()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '上传失败'
  } finally {
    uploading.value = false
  }
}

async function loadMedia() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listAdminMedia({
      keyword: filters.keyword || undefined,
      mediaType: filters.mediaType || undefined,
      usageTag: filters.usageTag || undefined,
      status: filters.status || undefined,
      page: page.value,
      size: pageSize.value,
    })
    mediaList.value = result.list || []
    total.value = Number(result.total || 0)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取媒体列表失败'
  } finally {
    loading.value = false
  }
}

async function reloadFirstPage() {
  page.value = 1
  await loadMedia()
}

async function changePage(nextPage: number) {
  page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  await loadMedia()
}

function openEdit(item: AdminMediaAsset) {
  editing.value = item
  editForm.usageTag = item.usageTag || 'OTHER'
  editForm.altText = item.altText || ''
  editForm.remark = item.remark || ''
  message.value = ''
  errorMessage.value = ''
}

function closeEdit() {
  editing.value = null
}

async function saveEdit() {
  if (!editing.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await updateAdminMedia(editing.value.id, {
      usageTag: editForm.usageTag,
      altText: editForm.altText || null,
      remark: editForm.remark || null,
      version: editing.value.version,
    })
    message.value = '保存成功'
    closeEdit()
    await loadMedia()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存媒体信息失败'
  } finally {
    saving.value = false
  }
}

async function deleteMedia(item: AdminMediaAsset) {
  if (!window.confirm(`确认删除媒体「${item.originalFilename}」？`)) return
  errorMessage.value = ''
  message.value = ''
  try {
    await deleteAdminMedia(item.id, item.version)
    message.value = '删除成功'
    await loadMedia()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '删除媒体失败'
  }
}

async function copyUrl(item: AdminMediaAsset) {
  const url = mediaUrl(item)
  try {
    await navigator.clipboard.writeText(url)
    message.value = 'URL 已复制'
  } catch {
    errorMessage.value = '复制失败，请手动复制 URL'
  }
}

function mediaUrl(item: AdminMediaAsset) {
  return item.absoluteUrl || item.publicUrl
}

function isImage(item: AdminMediaAsset) {
  return item.mediaType === 'IMAGE' || item.contentType?.startsWith('image/')
}

function usageLabel(value: string) {
  return usageTags.find((item) => item.value === value)?.label || value || '其他'
}

function formatFileSize(size: number) {
  const value = Number(size)
  if (!Number.isFinite(value)) return '-'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.media-library {
  display: grid;
  gap: 18px;
}

.media-library__header,
.media-library__filters,
.media-library__table,
.media-library__pagination {
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.media-library__header,
.media-library__filters,
.media-library__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.media-library__header p,
.media-library__header h2 {
  margin: 0;
}

.media-library__header p {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.media-library__header h2 {
  margin-top: 4px;
  color: #111827;
  font-size: 22px;
}

.media-library button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.media-library button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.media-library__ghost {
  border: 1px solid #cbd5e1 !important;
  background: #fff !important;
  color: #334155 !important;
}

.media-library__upload input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.media-library__filters {
  flex-wrap: wrap;
}

.media-library__search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 280px;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #64748b;
}

.media-library input,
.media-library select,
.media-library textarea {
  width: 100%;
  min-height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.media-library__search input {
  min-height: 34px;
  border: 0;
  outline: 0;
}

.media-library select {
  width: auto;
  min-width: 132px;
  padding: 0 10px;
}

.media-library__message,
.media-library__error {
  margin: 0;
  font-weight: 800;
}

.media-library__message {
  color: #047857;
}

.media-library__error {
  color: #b91c1c;
}

.media-library__table {
  overflow-x: auto;
}

.media-library table {
  width: 100%;
  border-collapse: collapse;
}

.media-library th,
.media-library td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  text-align: left;
  vertical-align: middle;
}

.media-library th {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.media-library td strong,
.media-library td small,
.media-library td code {
  display: block;
  max-width: 360px;
  overflow-wrap: anywhere;
}

.media-library td strong {
  color: #111827;
}

.media-library td small {
  margin-top: 5px;
  color: #64748b;
}

.media-library td code {
  margin-top: 6px;
  color: #475569;
  font-size: 12px;
}

.media-library__thumb,
.media-library__doc {
  display: grid;
  place-items: center;
  width: 76px;
  height: 54px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  color: #475569;
  object-fit: contain;
  font-size: 12px;
  font-weight: 900;
}

.media-library__status {
  display: inline-flex;
  min-width: 54px;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.media-library__status.active {
  background: #dcfce7;
  color: #166534;
}

.media-library__status.deleted {
  background: #fee2e2;
  color: #991b1b;
}

.media-library__actions {
  display: flex;
  gap: 8px;
}

.media-library__actions button,
.media-library__pagination button,
.media-library__dialog header button {
  width: 34px;
  min-height: 34px;
  padding: 0;
}

.media-library__empty {
  padding: 28px !important;
  color: #64748b;
  text-align: center !important;
}

.media-library__pagination div {
  display: flex;
  gap: 8px;
}

.media-library__modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(15 23 42 / 0.45);
}

.media-library__dialog {
  display: grid;
  gap: 14px;
  width: min(100%, 520px);
  padding: 20px;
  border-radius: 8px;
  background: #fff;
}

.media-library__dialog header,
.media-library__dialog footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.media-library__dialog h3 {
  margin: 0;
  color: #111827;
}

.media-library__dialog label {
  display: grid;
  gap: 6px;
  color: #334155;
  font-weight: 800;
}

.media-library__dialog textarea {
  min-height: 96px;
  padding: 10px;
  resize: vertical;
}

@media (max-width: 760px) {
  .media-library__header,
  .media-library__filters,
  .media-library__pagination {
    align-items: stretch;
    flex-direction: column;
  }

  .media-library select {
    width: 100%;
  }
}
</style>
