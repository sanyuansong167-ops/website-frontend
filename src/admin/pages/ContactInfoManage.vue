<template>
  <section class="contact-manage">
    <div class="contact-manage__panel">
      <header>
        <div>
          <h2>联系方式管理</h2>
          <p>保存后前台通过 /portal/api/contact-info 读取最新联系方式。</p>
        </div>
        <button type="button" :disabled="loading" @click="loadContactInfo">刷新</button>
      </header>

      <p v-if="errorMessage" class="contact-manage__error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="contact-manage__success">{{ successMessage }}</p>

      <form class="contact-manage__form" @submit.prevent="handleSubmit">
        <label>
          <span>联系地址 *</span>
          <textarea v-model.trim="form.contactAddress" maxlength="255" :disabled="loading || saving"></textarea>
        </label>

        <label>
          <span>商务电话 *</span>
          <input v-model.trim="form.businessPhone" maxlength="64" :disabled="loading || saving" />
        </label>

        <label>
          <span>联系邮箱 *</span>
          <input v-model.trim="form.contactEmail" maxlength="128" :disabled="loading || saving" />
        </label>

        <div class="contact-manage__meta">
          <span>Version: {{ form.version }}</span>
          <span v-if="form.updatedAt">Updated: {{ form.updatedAt }}</span>
        </div>

        <div class="contact-manage__actions">
          <button type="submit" :disabled="loading || saving">{{ saving ? '保存中...' : '保存联系方式' }}</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getAdminContactInfo, updateAdminContactInfo } from '../api/adminLead'

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({
  contactAddress: '',
  businessPhone: '',
  contactEmail: '',
  version: 0,
  updatedAt: '',
})

function fillForm(data) {
  form.contactAddress = data?.contactAddress || ''
  form.businessPhone = data?.businessPhone || ''
  form.contactEmail = data?.contactEmail || ''
  form.version = Number(data?.version ?? 0)
  form.updatedAt = data?.updatedAt || ''
}

function validateForm() {
  if (!form.contactAddress) return '联系地址不能为空'
  if (!form.businessPhone) return '商务电话不能为空'
  if (!form.contactEmail) return '联系邮箱不能为空'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) return '联系邮箱格式不正确'
  return ''
}

async function loadContactInfo() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    fillForm(await getAdminContactInfo())
  } catch (error) {
    errorMessage.value = error?.message || '读取联系方式失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const validationMessage = validateForm()
  errorMessage.value = ''
  successMessage.value = ''

  if (validationMessage) {
    errorMessage.value = validationMessage
    return
  }

  saving.value = true

  try {
    await updateAdminContactInfo({
      contactAddress: form.contactAddress,
      businessPhone: form.businessPhone,
      contactEmail: form.contactEmail,
      version: form.version,
    })
    successMessage.value = '联系方式已保存'
    await loadContactInfo()
  } catch (error) {
    errorMessage.value = error?.message || '保存联系方式失败'
  } finally {
    saving.value = false
  }
}

onMounted(loadContactInfo)
</script>

<style scoped>
.contact-manage {
  display: grid;
  gap: 18px;
}

.contact-manage__panel {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.contact-manage header,
.contact-manage__actions,
.contact-manage__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.contact-manage h2,
.contact-manage p {
  margin: 0;
}

.contact-manage h2 {
  color: #111827;
  font-size: 22px;
}

.contact-manage p {
  margin-top: 8px;
  color: #64748b;
}

.contact-manage__form {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.contact-manage label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.contact-manage input,
.contact-manage textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.contact-manage input {
  height: 38px;
  padding: 0 10px;
}

.contact-manage textarea {
  min-height: 96px;
  padding: 10px;
  resize: vertical;
}

.contact-manage button {
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

.contact-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.contact-manage__meta {
  justify-content: flex-start;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.contact-manage__error,
.contact-manage__success {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.contact-manage__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.contact-manage__success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}
</style>
