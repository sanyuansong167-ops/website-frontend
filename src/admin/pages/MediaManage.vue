<template>
  <section class="media-manage">
    <div class="media-manage__toolbar">
      <div>
        <h2>媒体上传</h2>
        <p>上传后的 URL 可用于后续 Banner、产品、案例等内容表单。</p>
      </div>
      <button type="button" :disabled="uploading || !selectedFile" @click="handleUpload">
        {{ uploading ? '上传中...' : '上传文件' }}
      </button>
    </div>

    <div class="media-manage__uploader">
      <label class="media-manage__picker">
        <input type="file" accept="image/*,application/pdf" :disabled="uploading" @change="handleFileChange" />
        <span>{{ selectedFile ? selectedFile.name : '选择图片或 PDF 文件' }}</span>
      </label>
      <p v-if="selectedFile" class="media-manage__file">
        {{ formatFileSize(selectedFile.size) }} · {{ selectedFile.type || '未知类型' }}
      </p>
      <p v-if="errorMessage" class="media-manage__error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="media-manage__success">{{ successMessage }}</p>
    </div>

    <article v-if="uploadResult" class="media-manage__result">
      <header>
        <h3>上传结果</h3>
        <span>{{ uploadResult.mediaType || 'MEDIA' }}</span>
      </header>

      <dl>
        <div>
          <dt>媒体 ID</dt>
          <dd>{{ uploadResult.mediaId }}</dd>
        </div>
        <div>
          <dt>文件名</dt>
          <dd>{{ uploadResult.originalFilename }}</dd>
        </div>
        <div>
          <dt>文件类型</dt>
          <dd>{{ uploadResult.contentType }}</dd>
        </div>
        <div>
          <dt>大小</dt>
          <dd>{{ formatFileSize(uploadResult.size) }}</dd>
        </div>
      </dl>

      <label>
        <span>公开 URL</span>
        <div class="media-manage__url">
          <input :value="uploadResult.absoluteUrl || uploadResult.url" readonly />
          <button type="button" @click="copyUrl">复制</button>
        </div>
      </label>

      <img v-if="isImageResult" class="media-manage__preview" :src="uploadResult.absoluteUrl || uploadResult.url" alt="" />
    </article>

    <div v-else-if="!errorMessage" class="media-manage__empty">
      <strong>暂无上传结果</strong>
      <span>选择文件并上传后，返回的 URL 会显示在这里。</span>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { uploadAdminMedia } from '../api/adminMedia'

const selectedFile = ref(null)
const uploadResult = ref(null)
const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isImageResult = computed(() => uploadResult.value?.contentType?.startsWith('image/'))

function handleFileChange(event) {
  const file = event.target.files?.[0] || null
  selectedFile.value = file
  uploadResult.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

function formatFileSize(size) {
  if (!Number.isFinite(Number(size))) return '-'
  const value = Number(size)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

async function handleUpload() {
  if (!selectedFile.value) {
    errorMessage.value = '请先选择文件'
    return
  }

  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    uploadResult.value = await uploadAdminMedia(selectedFile.value)
    successMessage.value = '上传成功'
  } catch (error) {
    errorMessage.value = error?.message || '上传失败'
  } finally {
    uploading.value = false
  }
}

async function copyUrl() {
  const url = uploadResult.value?.absoluteUrl || uploadResult.value?.url
  if (!url) return

  try {
    await navigator.clipboard.writeText(url)
    successMessage.value = 'URL 已复制'
  } catch {
    successMessage.value = '请手动复制 URL'
  }
}
</script>

<style scoped>
.media-manage {
  display: grid;
  gap: 20px;
}

.media-manage__toolbar,
.media-manage__uploader,
.media-manage__result,
.media-manage__empty {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.media-manage__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.media-manage h2,
.media-manage h3,
.media-manage p {
  margin: 0;
}

.media-manage h2 {
  color: #111827;
  font-size: 22px;
}

.media-manage p {
  margin-top: 8px;
  color: #64748b;
  line-height: 1.6;
}

.media-manage button {
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.media-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.media-manage__picker {
  display: grid;
  place-items: center;
  min-height: 120px;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-weight: 800;
  cursor: pointer;
}

.media-manage__picker input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.media-manage__file,
.media-manage__error,
.media-manage__success {
  font-weight: 700;
}

.media-manage__error {
  color: #b91c1c;
}

.media-manage__success {
  color: #047857;
}

.media-manage__result header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.media-manage__result h3 {
  color: #111827;
  font-size: 18px;
}

.media-manage__result header span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 900;
}

.media-manage dl {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 18px;
}

.media-manage dt {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.media-manage dd {
  margin: 6px 0 0;
  min-width: 0;
  overflow-wrap: anywhere;
  color: #111827;
  font-weight: 700;
}

.media-manage__url {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.media-manage__url input {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  font: inherit;
}

.media-manage__preview {
  display: block;
  width: min(100%, 420px);
  max-height: 260px;
  margin-top: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  object-fit: contain;
}

.media-manage__empty {
  display: grid;
  gap: 6px;
  color: #64748b;
}

.media-manage__empty strong {
  color: #334155;
}

@media (max-width: 900px) {
  .media-manage__toolbar,
  .media-manage__url {
    align-items: stretch;
    flex-direction: column;
  }

  .media-manage dl {
    grid-template-columns: 1fr;
  }
}
</style>
