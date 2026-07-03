<template>
  <div class="media-picker">
    <article v-if="selectedMedia" class="media-picker__selected">
      <img v-if="isImage(selectedMedia)" :src="mediaUrl(selectedMedia)" :alt="selectedMedia.altText || ''" />
      <span v-else class="media-picker__file">DOC</span>
      <div>
        <strong>{{ selectedMedia.originalFilename }}</strong>
        <small>ID: {{ selectedMedia.id }}</small>
        <code>{{ selectedMedia.publicUrl }}</code>
      </div>
      <button type="button" title="清除" @click="clearSelection">
        <X :size="16" />
      </button>
    </article>
    <article v-else class="media-picker__empty">
      <span>未选择媒体</span>
    </article>

    <button type="button" class="media-picker__open" @click="openDialog">
      <ImagePlus :size="16" />
      <span>选择媒体</span>
    </button>

    <div v-if="dialogOpen" class="media-picker__modal" role="dialog" aria-modal="true">
      <section class="media-picker__dialog">
        <header>
          <h3>选择媒体</h3>
          <button type="button" title="关闭" @click="closeDialog">
            <X :size="18" />
          </button>
        </header>

        <div class="media-picker__filters">
          <label>
            <Search :size="15" />
            <input v-model.trim="keyword" placeholder="搜索文件名或 URL" @keyup.enter="reloadFirstPage" />
          </label>
          <select v-model="currentUsageTag" @change="reloadFirstPage">
            <option value="">全部用途</option>
            <option v-for="item in usageTags" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <select v-model="currentMediaType" @change="reloadFirstPage">
            <option value="IMAGE">图片</option>
            <option value="DOCUMENT">文档</option>
            <option value="">全部类型</option>
          </select>
        </div>

        <p v-if="errorMessage" class="media-picker__error">{{ errorMessage }}</p>

        <div class="media-picker__grid">
          <button v-for="item in mediaList" :key="item.id" type="button" @click="selectMedia(item)">
            <img v-if="isImage(item)" :src="mediaUrl(item)" :alt="item.altText || ''" />
            <span v-else class="media-picker__file">DOC</span>
            <strong>{{ item.originalFilename }}</strong>
            <small>ID: {{ item.id }} / {{ usageLabel(item.usageTag) }}</small>
          </button>
          <div v-if="!loading && mediaList.length === 0" class="media-picker__no-data">暂无可选媒体</div>
          <div v-if="loading" class="media-picker__no-data">加载中...</div>
        </div>

        <footer>
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
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, ImagePlus, Search, X } from 'lucide-vue-next'
import { getAdminMedia, listAdminMedia, type AdminMediaAsset } from '../api/adminMedia'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    usageTag?: string
    mediaType?: string
  }>(),
  {
    usageTag: '',
    mediaType: 'IMAGE',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: number | null): void
  (event: 'select', media: AdminMediaAsset): void
  (event: 'clear'): void
}>()

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

const selectedMedia = ref<AdminMediaAsset | null>(null)
const mediaList = ref<AdminMediaAsset[]>([])
const dialogOpen = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const keyword = ref('')
const currentUsageTag = ref(props.usageTag || '')
const currentMediaType = ref(props.mediaType || 'IMAGE')
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

onMounted(loadSelectedMedia)

watch(
  () => props.modelValue,
  () => loadSelectedMedia(),
)

watch(
  () => props.usageTag,
  (value) => {
    currentUsageTag.value = value || ''
  },
)

watch(
  () => props.mediaType,
  (value) => {
    currentMediaType.value = value || 'IMAGE'
  },
)

async function loadSelectedMedia() {
  if (!props.modelValue) {
    selectedMedia.value = null
    return
  }
  try {
    selectedMedia.value = await getAdminMedia(props.modelValue)
  } catch {
    selectedMedia.value = null
  }
}

async function openDialog() {
  dialogOpen.value = true
  page.value = 1
  currentUsageTag.value = props.usageTag || currentUsageTag.value
  currentMediaType.value = props.mediaType || currentMediaType.value || 'IMAGE'
  await loadMedia()
}

function closeDialog() {
  dialogOpen.value = false
}

async function loadMedia() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listAdminMedia({
      keyword: keyword.value || undefined,
      usageTag: currentUsageTag.value || undefined,
      mediaType: currentMediaType.value || undefined,
      status: 'ACTIVE',
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

function selectMedia(media: AdminMediaAsset) {
  selectedMedia.value = media
  emit('update:modelValue', media.id)
  emit('select', media)
  closeDialog()
}

function clearSelection() {
  selectedMedia.value = null
  emit('update:modelValue', null)
  emit('clear')
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
</script>

<style scoped>
.media-picker {
  display: grid;
  gap: 10px;
}

.media-picker__selected,
.media-picker__empty {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 76px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.media-picker__empty {
  color: #64748b;
  font-weight: 800;
}

.media-picker img,
.media-picker__file {
  display: grid;
  place-items: center;
  width: 72px;
  height: 52px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  object-fit: contain;
  color: #475569;
  font-size: 12px;
  font-weight: 900;
}

.media-picker strong,
.media-picker small,
.media-picker code {
  display: block;
  overflow-wrap: anywhere;
}

.media-picker strong {
  color: #111827;
}

.media-picker small,
.media-picker code {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.media-picker button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

.media-picker button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.media-picker__selected > button {
  width: 34px;
  padding: 0;
  margin-left: auto;
  background: #ef4444;
}

.media-picker__open {
  width: fit-content;
}

.media-picker__modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(15 23 42 / 0.45);
}

.media-picker__dialog {
  display: grid;
  gap: 14px;
  width: min(100%, 860px);
  max-height: calc(100vh - 36px);
  padding: 18px;
  overflow: auto;
  border-radius: 8px;
  background: #fff;
}

.media-picker__dialog header,
.media-picker__dialog footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.media-picker__dialog h3 {
  margin: 0;
  color: #111827;
}

.media-picker__dialog header button,
.media-picker__dialog footer button {
  width: 34px;
  padding: 0;
}

.media-picker__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.media-picker__filters label {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 1 260px;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #64748b;
}

.media-picker__filters input,
.media-picker__filters select {
  min-height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.media-picker__filters input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
}

.media-picker__filters select {
  min-width: 130px;
  padding: 0 10px;
}

.media-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}

.media-picker__grid button {
  display: grid;
  justify-items: start;
  min-height: 166px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  text-align: left;
}

.media-picker__grid button:hover {
  border-color: #2563eb;
}

.media-picker__grid img,
.media-picker__grid .media-picker__file {
  width: 100%;
  height: 90px;
}

.media-picker__no-data {
  grid-column: 1 / -1;
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.media-picker__error {
  margin: 0;
  color: #b91c1c;
  font-weight: 800;
}

@media (max-width: 680px) {
  .media-picker__dialog header,
  .media-picker__dialog footer,
  .media-picker__filters {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
