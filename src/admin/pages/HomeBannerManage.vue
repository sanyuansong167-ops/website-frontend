<template>
  <section class="home-banner-manage">
    <div class="home-banner-manage__toolbar">
      <div>
        <h2>首页 Banner</h2>
        <p>维护首页首屏主标题、副标题、背景图媒体 ID 和双 CTA 配置。</p>
      </div>
      <button type="button" :disabled="loading || saving" @click="loadBanner">刷新</button>
    </div>

    <p v-if="errorMessage" class="home-banner-manage__error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="home-banner-manage__success">{{ successMessage }}</p>

    <form v-if="!loading" class="home-banner-manage__form" @submit.prevent="handleSubmit">
      <div class="home-banner-manage__grid">
        <label class="home-banner-manage__wide">
          <span>主标题 *</span>
          <input v-model.trim="form.mainTitle" maxlength="120" :disabled="saving" />
        </label>

        <label class="home-banner-manage__wide">
          <span>副标题</span>
          <textarea v-model.trim="form.subTitle" maxlength="500" :disabled="saving"></textarea>
        </label>

        <label>
          <span>背景图媒体 ID</span>
          <input v-model.trim="form.backgroundImageMediaId" inputmode="numeric" :disabled="saving" />
        </label>
      </div>

      <figure class="home-banner-manage__preview">
        <figcaption>背景图预览</figcaption>
        <img v-if="form.backgroundImageUrl" :src="form.backgroundImageUrl" alt="" />
        <span v-else>暂无图片</span>
      </figure>

      <div class="home-banner-manage__buttons">
        <ButtonEditor v-model="form.primaryButton" title="主按钮" :disabled="saving" />
        <ButtonEditor v-model="form.secondaryButton" title="次按钮" :disabled="saving" />
      </div>

      <div class="home-banner-manage__actions">
        <router-link to="/admin/media">去上传媒体</router-link>
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存 Banner' }}</button>
      </div>
    </form>

    <div v-else class="home-banner-manage__empty">正在读取首页 Banner...</div>
  </section>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { getAdminHomeBanner, updateAdminHomeBanner } from '../api/adminSite'

const targetTypes = ['PAGE_ANCHOR', 'INTERNAL_ROUTE', 'EXTERNAL_LINK']
const defaultButton = () => ({
  enabled: false,
  text: '',
  targetType: 'PAGE_ANCHOR',
  routePath: '/',
  anchorCode: '',
  externalUrl: '',
  openInNewTab: false,
})

const ButtonEditor = defineComponent({
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const update = (patch) => emit('update:modelValue', { ...props.modelValue, ...patch })
    const targetType = computed(() => props.modelValue.targetType || 'PAGE_ANCHOR')

    return () => h('section', { class: 'home-banner-manage__button-editor' }, [
      h('header', [
        h('h3', props.title),
        h('label', { class: 'home-banner-manage__switch' }, [
          h('input', {
            type: 'checkbox',
            checked: props.modelValue.enabled,
            disabled: props.disabled,
            onChange: (event) => update({ enabled: event.target.checked }),
          }),
          h('span', '启用'),
        ]),
      ]),
      h('label', [
        h('span', '按钮文案'),
        h('input', {
          value: props.modelValue.text,
          maxlength: 32,
          disabled: props.disabled || !props.modelValue.enabled,
          onInput: (event) => update({ text: event.target.value }),
        }),
      ]),
      h('label', [
        h('span', '跳转类型'),
        h(
          'select',
          {
            value: targetType.value,
            disabled: props.disabled || !props.modelValue.enabled,
            onChange: (event) => update({ targetType: event.target.value }),
          },
          targetTypes.map((type) => h('option', { value: type }, type)),
        ),
      ]),
      targetType.value === 'INTERNAL_ROUTE'
        ? h('label', [
            h('span', '内部路由'),
            h('input', {
              value: props.modelValue.routePath,
              maxlength: 255,
              disabled: props.disabled || !props.modelValue.enabled,
              onInput: (event) => update({ routePath: event.target.value }),
            }),
          ])
        : null,
      targetType.value === 'PAGE_ANCHOR'
        ? h('label', [
            h('span', '页面锚点'),
            h('input', {
              value: props.modelValue.anchorCode,
              maxlength: 64,
              disabled: props.disabled || !props.modelValue.enabled,
              onInput: (event) => update({ anchorCode: event.target.value }),
            }),
          ])
        : null,
      targetType.value === 'EXTERNAL_LINK'
        ? h('label', [
            h('span', '外部链接'),
            h('input', {
              value: props.modelValue.externalUrl,
              maxlength: 500,
              disabled: props.disabled || !props.modelValue.enabled,
              onInput: (event) => update({ externalUrl: event.target.value }),
            }),
          ])
        : null,
      targetType.value === 'EXTERNAL_LINK'
        ? h('label', { class: 'home-banner-manage__switch' }, [
            h('input', {
              type: 'checkbox',
              checked: props.modelValue.openInNewTab,
              disabled: props.disabled || !props.modelValue.enabled,
              onChange: (event) => update({ openInNewTab: event.target.checked }),
            }),
            h('span', '新窗口打开'),
          ])
        : null,
    ])
  },
})

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({
  version: 0,
  mainTitle: '',
  subTitle: '',
  backgroundImageMediaId: '',
  backgroundImageUrl: '',
  primaryButton: defaultButton(),
  secondaryButton: defaultButton(),
})

function toMediaId(value) {
  if (value === '' || value === null || value === undefined) return null
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

function normalizeButton(button) {
  return {
    ...defaultButton(),
    ...(button || {}),
    enabled: button?.enabled === true,
    openInNewTab: button?.openInNewTab === true,
  }
}

function fillForm(data) {
  form.version = data.version ?? 0
  form.mainTitle = data.mainTitle || ''
  form.subTitle = data.subTitle || ''
  form.backgroundImageMediaId = data.backgroundImageMediaId ?? ''
  form.backgroundImageUrl = data.backgroundImageUrl || ''
  form.primaryButton = normalizeButton(data.primaryButton)
  form.secondaryButton = normalizeButton(data.secondaryButton)
}

function cleanButton(button) {
  if (!button.enabled) return { ...defaultButton(), enabled: false }

  return {
    enabled: true,
    text: button.text || '',
    targetType: button.targetType || 'PAGE_ANCHOR',
    routePath: button.targetType === 'INTERNAL_ROUTE' ? button.routePath || '' : '',
    anchorCode: button.targetType === 'PAGE_ANCHOR' ? button.anchorCode || '' : '',
    externalUrl: button.targetType === 'EXTERNAL_LINK' ? button.externalUrl || '' : '',
    openInNewTab: button.targetType === 'EXTERNAL_LINK' ? button.openInNewTab === true : false,
  }
}

async function loadBanner() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    fillForm(await getAdminHomeBanner())
  } catch (error) {
    errorMessage.value = error?.message || '读取首页 Banner 失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.mainTitle) {
    errorMessage.value = '主标题不能为空'
    return
  }

  saving.value = true

  try {
    fillForm(await updateAdminHomeBanner({
      version: form.version,
      mainTitle: form.mainTitle,
      subTitle: form.subTitle,
      backgroundImageMediaId: toMediaId(form.backgroundImageMediaId),
      primaryButton: cleanButton(form.primaryButton),
      secondaryButton: cleanButton(form.secondaryButton),
    }))
    successMessage.value = '首页 Banner 已保存'
  } catch (error) {
    errorMessage.value = error?.message || '保存首页 Banner 失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadBanner)
</script>

<style scoped>
.home-banner-manage {
  display: grid;
  gap: 18px;
}

.home-banner-manage__toolbar,
.home-banner-manage__form,
.home-banner-manage__empty {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.home-banner-manage__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.home-banner-manage h2,
.home-banner-manage h3,
.home-banner-manage p {
  margin: 0;
}

.home-banner-manage h2 {
  color: #111827;
  font-size: 22px;
}

.home-banner-manage p {
  margin-top: 8px;
  color: #64748b;
}

.home-banner-manage__grid,
.home-banner-manage__buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.home-banner-manage__wide {
  grid-column: 1 / -1;
}

.home-banner-manage label,
:deep(.home-banner-manage__button-editor label) {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.home-banner-manage input,
.home-banner-manage textarea,
:deep(.home-banner-manage__button-editor input),
:deep(.home-banner-manage__button-editor select) {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.home-banner-manage input,
:deep(.home-banner-manage__button-editor input),
:deep(.home-banner-manage__button-editor select) {
  height: 38px;
  padding: 0 10px;
}

.home-banner-manage textarea {
  min-height: 92px;
  padding: 10px;
  resize: vertical;
}

.home-banner-manage__preview {
  margin: 18px 0;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.home-banner-manage__preview figcaption {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.home-banner-manage__preview img {
  display: block;
  width: min(100%, 520px);
  max-height: 220px;
  object-fit: contain;
}

:deep(.home-banner-manage__button-editor) {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

:deep(.home-banner-manage__button-editor header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

:deep(.home-banner-manage__button-editor h3) {
  color: #111827;
  font-size: 16px;
}

:deep(.home-banner-manage__switch) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.home-banner-manage__switch input) {
  width: 16px;
  height: 16px;
}

.home-banner-manage__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 18px;
}

.home-banner-manage a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.home-banner-manage button {
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

.home-banner-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.home-banner-manage__error,
.home-banner-manage__success {
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.home-banner-manage__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.home-banner-manage__success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}

@media (max-width: 900px) {
  .home-banner-manage__toolbar,
  .home-banner-manage__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .home-banner-manage__grid,
  .home-banner-manage__buttons {
    grid-template-columns: 1fr;
  }
}
</style>
