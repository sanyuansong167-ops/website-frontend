<template>
  <section class="site-config-manage">
    <div class="site-config-manage__toolbar">
      <div>
        <h2>站点配置</h2>
        <p>维护网站标题、SEO、品牌文案和亮暗 Logo 媒体 ID。</p>
      </div>
      <button type="button" :disabled="loading || saving" @click="loadConfig">刷新</button>
    </div>

    <p v-if="errorMessage" class="site-config-manage__error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="site-config-manage__success">{{ successMessage }}</p>

    <form v-if="!loading" class="site-config-manage__form" @submit.prevent="handleSubmit">
      <div class="site-config-manage__grid">
        <label>
          <span>网站标题 *</span>
          <input v-model.trim="form.siteTitle" maxlength="120" :disabled="saving" />
        </label>

        <label>
          <span>品牌主张 *</span>
          <input v-model.trim="form.brandSlogan" maxlength="160" :disabled="saving" />
        </label>

        <label class="site-config-manage__wide">
          <span>品牌副标语</span>
          <input v-model.trim="form.brandTagline" maxlength="255" :disabled="saving" />
        </label>

        <label class="site-config-manage__wide">
          <span>SEO 关键词</span>
          <input v-model.trim="form.seoKeywords" maxlength="255" :disabled="saving" />
        </label>

        <label class="site-config-manage__wide">
          <span>SEO 描述</span>
          <textarea v-model.trim="form.seoDescription" maxlength="500" :disabled="saving"></textarea>
        </label>

        <label>
          <span>浅色 Logo 媒体 ID</span>
          <input v-model.trim="form.logoLightMediaId" inputmode="numeric" :disabled="saving" />
        </label>

        <label>
          <span>深色 Logo 媒体 ID</span>
          <input v-model.trim="form.logoDarkMediaId" inputmode="numeric" :disabled="saving" />
        </label>
      </div>

      <div class="site-config-manage__preview">
        <figure>
          <figcaption>浅色 Logo</figcaption>
          <img v-if="form.logoLightUrl" :src="form.logoLightUrl" alt="" />
          <span v-else>暂无图片</span>
        </figure>
        <figure>
          <figcaption>深色 Logo</figcaption>
          <img v-if="form.logoDarkUrl" :src="form.logoDarkUrl" alt="" />
          <span v-else>暂无图片</span>
        </figure>
      </div>

      <div class="site-config-manage__actions">
        <router-link to="/admin/media">去上传媒体</router-link>
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存配置' }}</button>
      </div>
    </form>

    <div v-else class="site-config-manage__empty">正在读取站点配置...</div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getAdminSiteConfig, updateAdminSiteConfig } from '../api/adminSite'

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({
  version: 0,
  siteTitle: '',
  seoKeywords: '',
  seoDescription: '',
  brandSlogan: '',
  brandTagline: '',
  logoLightMediaId: '',
  logoLightUrl: '',
  logoDarkMediaId: '',
  logoDarkUrl: '',
})

function toMediaId(value) {
  if (value === '' || value === null || value === undefined) return null
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

function fillForm(data) {
  form.version = data.version ?? 0
  form.siteTitle = data.siteTitle || ''
  form.seoKeywords = data.seoKeywords || ''
  form.seoDescription = data.seoDescription || ''
  form.brandSlogan = data.brandSlogan || ''
  form.brandTagline = data.brandTagline || ''
  form.logoLightMediaId = data.logoLightMediaId ?? ''
  form.logoLightUrl = data.logoLightUrl || ''
  form.logoDarkMediaId = data.logoDarkMediaId ?? ''
  form.logoDarkUrl = data.logoDarkUrl || ''
}

async function loadConfig() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    fillForm(await getAdminSiteConfig())
  } catch (error) {
    errorMessage.value = error?.message || '读取站点配置失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.siteTitle || !form.brandSlogan) {
    errorMessage.value = '网站标题和品牌主张不能为空'
    return
  }

  saving.value = true

  try {
    fillForm(await updateAdminSiteConfig({
      version: form.version,
      siteTitle: form.siteTitle,
      seoKeywords: form.seoKeywords,
      seoDescription: form.seoDescription,
      brandSlogan: form.brandSlogan,
      brandTagline: form.brandTagline,
      logoLightMediaId: toMediaId(form.logoLightMediaId),
      logoDarkMediaId: toMediaId(form.logoDarkMediaId),
    }))
    successMessage.value = '站点配置已保存'
  } catch (error) {
    errorMessage.value = error?.message || '保存站点配置失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>

<style scoped>
.site-config-manage {
  display: grid;
  gap: 18px;
}

.site-config-manage__toolbar,
.site-config-manage__form,
.site-config-manage__empty {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.site-config-manage__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.site-config-manage h2,
.site-config-manage p {
  margin: 0;
}

.site-config-manage h2 {
  color: #111827;
  font-size: 22px;
}

.site-config-manage p {
  margin-top: 8px;
  color: #64748b;
}

.site-config-manage__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.site-config-manage label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.site-config-manage__wide {
  grid-column: 1 / -1;
}

.site-config-manage input,
.site-config-manage textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.site-config-manage input {
  height: 38px;
  padding: 0 10px;
}

.site-config-manage textarea {
  min-height: 92px;
  padding: 10px;
  resize: vertical;
}

.site-config-manage__preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.site-config-manage figure {
  margin: 0;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.site-config-manage figcaption {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.site-config-manage img {
  display: block;
  max-width: 100%;
  max-height: 96px;
  object-fit: contain;
}

.site-config-manage figure span {
  color: #94a3b8;
}

.site-config-manage__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.site-config-manage a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.site-config-manage button {
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

.site-config-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.site-config-manage__error,
.site-config-manage__success {
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.site-config-manage__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.site-config-manage__success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}

@media (max-width: 900px) {
  .site-config-manage__toolbar,
  .site-config-manage__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .site-config-manage__grid,
  .site-config-manage__preview {
    grid-template-columns: 1fr;
  }
}
</style>
