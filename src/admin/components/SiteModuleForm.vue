<template>
  <div class="site-module-form" role="dialog" aria-modal="true">
    <form class="site-module-form__dialog" @submit.prevent="submitForm">
      <div class="site-module-form__header">
        <h3>{{ mode === 'create' ? `新增 ${config.title}` : `编辑 ${config.title}` }}</h3>
        <button type="button" class="site-module-form__icon-button" @click="$emit('cancel')">×</button>
      </div>

      <p v-if="localError" class="site-module-form__error">{{ localError }}</p>

      <div class="site-module-form__grid">
        <template v-for="field in visibleFields" :key="field.key">
          <label :class="{ 'site-module-form__wide': field.type === 'textarea' }">
            {{ field.label }}
            <textarea
              v-if="field.type === 'textarea'"
              v-model.trim="model[field.key]"
              :maxlength="field.maxLength"
              :required="field.required"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
            />
            <span v-else-if="field.type === 'switch'" class="site-module-form__switch">
              <input v-model="model[field.key]" type="checkbox" :disabled="field.disabled" />
              <span>{{ model[field.key] ? '显示' : '隐藏' }}</span>
            </span>
            <input
              v-else-if="field.type === 'number' || field.type === 'media-id'"
              v-model.number="model[field.key]"
              type="number"
              :min="field.min"
              :maxlength="field.maxLength"
              :required="field.required"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
            />
            <input
              v-else
              v-model.trim="model[field.key]"
              :maxlength="field.maxLength"
              :required="field.required"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
            />
          </label>
        </template>
      </div>

      <div v-for="preview in previewFields" :key="preview.key" class="site-module-form__preview">
        <img v-if="model[preview.key]" :src="String(model[preview.key])" alt="" />
        <span>{{ preview.label }}</span>
      </div>

      <div class="site-module-form__actions">
        <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <button type="button" class="site-module-form__ghost-button" :disabled="saving" @click="$emit('cancel')">
          取消
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { SiteModuleFormConfig } from '../config/adminSiteModuleFormConfig'

const props = defineProps<{
  config: SiteModuleFormConfig
  formData: Record<string, unknown>
  mode: 'create' | 'edit'
  saving?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: Record<string, unknown>]
  cancel: []
}>()

const model = reactive<Record<string, unknown>>({})
const localError = ref('')

const visibleFields = computed(() => props.config.fields.filter((field) => field.submit !== false))
const previewFields = computed(() => props.config.fields.filter((field) => field.submit === false && field.key.toLowerCase().includes('url')))

watch(
  () => props.formData,
  () => {
    Object.keys(model).forEach((key) => delete model[key])
    props.config.fields.forEach((field) => {
      model[field.key] = props.formData[field.key] ?? field.defaultValue ?? (field.type === 'switch' ? true : '')
    })
    localError.value = ''
  },
  { immediate: true, deep: true },
)

function toPayloadValue(value: unknown) {
  if (value === '') return null
  return value
}

function submitForm() {
  localError.value = ''
  const payload: Record<string, unknown> = {}

  for (const field of props.config.fields) {
    if (field.submit === false) continue
    const value = model[field.key]
    if (field.required && (value === '' || value === null || value === undefined)) {
      localError.value = `请填写${field.label}`
      return
    }
    payload[field.key] = field.submitValue ? field.submitValue(value) : toPayloadValue(value)
  }

  if (props.mode === 'edit') {
    payload[props.config.versionField] = props.formData[props.config.versionField] ?? 0
  }

  emit('submit', payload)
}
</script>

<style scoped>
.site-module-form {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(15 23 42 / 0.42);
}

.site-module-form__dialog {
  display: grid;
  gap: 18px;
  width: min(760px, 100%);
  max-height: min(760px, calc(100vh - 48px));
  overflow: auto;
  padding: 20px;
  border: 1px solid #d9dee6;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 20px 60px rgb(15 23 42 / 0.22);
}

.site-module-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.site-module-form__header h3 {
  margin: 0;
}

.site-module-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.site-module-form label {
  display: grid;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.site-module-form__wide {
  grid-column: 1 / -1;
}

.site-module-form input,
.site-module-form textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
}

.site-module-form input {
  height: 38px;
  padding: 0 10px;
}

.site-module-form textarea {
  min-height: 120px;
  padding: 10px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
}

.site-module-form__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.site-module-form__switch input {
  width: 18px;
  height: 18px;
  padding: 0;
}

.site-module-form__preview {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 13px;
}

.site-module-form__preview img {
  width: 72px;
  height: 72px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  object-fit: contain;
}

.site-module-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.site-module-form button {
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

.site-module-form button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.site-module-form__ghost-button,
.site-module-form__icon-button {
  border: 1px solid #cbd5e1 !important;
  background: #fff !important;
  color: #334155 !important;
}

.site-module-form__icon-button {
  min-width: 34px;
  width: 34px;
  padding: 0 !important;
  font-size: 22px !important;
  line-height: 1;
}

.site-module-form__error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 6px;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
}

@media (max-width: 720px) {
  .site-module-form__header {
    align-items: stretch;
    flex-direction: column;
  }

  .site-module-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
