<template>
  <section class="product-manage">
    <div class="product-manage__toolbar">
      <div>
        <h2>产品管理</h2>
        <p>维护官网产品矩阵，保存后前台通过 /portal/api/products 读取最新数据。</p>
      </div>
      <div class="product-manage__toolbar-actions">
        <button type="button" :disabled="loading" @click="loadProducts">刷新</button>
        <button type="button" :disabled="saving" @click="resetForm">新增产品</button>
      </div>
    </div>

    <p v-if="errorMessage" class="product-manage__error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="product-manage__success">{{ successMessage }}</p>

    <form class="product-manage__form" @submit.prevent="handleSubmit">
      <header>
        <h3>{{ editingProductId ? '编辑产品' : '新增产品' }}</h3>
        <span v-if="editingProductId">ID: {{ editingProductId }} · version: {{ form.version }}</span>
      </header>

      <div class="product-manage__grid">
        <label>
          <span>产品名称 *</span>
          <input v-model.trim="form.name" maxlength="128" :disabled="saving" />
        </label>

        <label>
          <span>Logo 媒体 ID *</span>
          <input v-model.trim="form.logoId" inputmode="numeric" :disabled="saving" />
        </label>

        <label>
          <span>副标题</span>
          <input v-model.trim="form.subTitle" maxlength="256" :disabled="saving" />
        </label>

        <label>
          <span>状态标签</span>
          <input v-model.trim="form.statusTag" maxlength="64" :disabled="saving" />
        </label>

        <label>
          <span>内容状态</span>
          <select v-model="form.status" :disabled="saving">
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已发布</option>
            <option value="OFFLINE">已下线</option>
          </select>
        </label>

        <label class="product-manage__wide">
          <span>产品摘要 *</span>
          <textarea v-model.trim="form.abstractText" maxlength="512" :disabled="saving"></textarea>
        </label>

        <label>
          <span>详情链接</span>
          <input v-model.trim="form.detailLink" maxlength="256" placeholder="/product 或 https://..." :disabled="saving" />
        </label>

        <label>
          <span>排序值</span>
          <input v-model.trim="form.sortOrder" inputmode="numeric" :disabled="saving" />
        </label>

        <label>
          <span>是否展示</span>
          <select v-model.number="form.visible" :disabled="saving">
            <option :value="1">展示</option>
            <option :value="0">隐藏</option>
          </select>
        </label>
      </div>

      <div class="product-manage__form-actions">
        <router-link to="/admin/media">去上传 Logo</router-link>
        <div>
          <button type="button" :disabled="saving" @click="resetForm">清空</button>
          <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存产品' }}</button>
        </div>
      </div>
    </form>

    <div class="product-manage__list">
      <header>
        <div>
          <h3>产品列表</h3>
          <span>{{ page.total }} 条记录</span>
        </div>
        <button type="button" :disabled="sortSaving || !canSaveSort" @click="handleSaveSort">
          {{ sortSaving ? '排序保存中...' : '保存当前排序' }}
        </button>
      </header>

      <div v-if="loading" class="product-manage__empty">正在读取产品列表...</div>
      <div v-else-if="!products.length" class="product-manage__empty">暂无产品数据</div>

      <table v-else>
        <thead>
          <tr>
            <th>排序</th>
            <th>产品</th>
            <th>Logo</th>
            <th>状态</th>
            <th>详情链接</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <input
                class="product-manage__sort"
                :value="product.sortOrder"
                inputmode="numeric"
                @input="product.sortOrder = Number($event.target.value) || 0"
              />
            </td>
            <td>
              <strong>{{ product.name }}</strong>
              <span>{{ product.subTitle || '无副标题' }}</span>
              <small>{{ product.abstractText }}</small>
            </td>
            <td>
              <img v-if="product.logo?.url" :src="product.logo.url" alt="" />
              <span v-else>ID: {{ product.logo?.id || '-' }}</span>
            </td>
            <td>
              <span :class="['product-manage__status', product.visible === 1 ? 'is-visible' : '']">
                {{ product.visible === 1 ? '展示' : '隐藏' }}
              </span>
              <span :class="['product-manage__content-status', statusClass(product.status)]">
                {{ statusLabel(product.status) }}
              </span>
              <small>{{ product.statusTag || '无标签' }}</small>
            </td>
            <td>{{ product.detailLink || '-' }}</td>
            <td>
              <button type="button" @click="editProduct(product)">编辑</button>
              <button type="button" @click="changeProductStatus(product, 'DRAFT')">草稿</button>
              <button type="button" @click="changeProductStatus(product, 'PUBLISHED')">发布</button>
              <button type="button" @click="changeProductStatus(product, 'OFFLINE')">下线</button>
              <button type="button" class="is-danger" @click="handleDelete(product)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="products.length && !canSaveSort" class="product-manage__hint">
        当前列表未覆盖全部产品，后端排序接口要求完整覆盖全部活跃产品，因此暂不可保存排序。
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  sortAdminProducts,
  updateAdminProduct,
  updateAdminProductStatus,
} from '../api/adminProduct'

const pageSize = 100
const products = ref([])
const loading = ref(true)
const saving = ref(false)
const sortSaving = ref(false)
const editingProductId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')
const page = reactive({
  total: 0,
  pageNo: 1,
  pageSize,
})
const form = reactive(emptyForm())
const canSaveSort = computed(() => products.value.length > 0 && products.value.length === Number(page.total))

function emptyForm() {
  return {
    name: '',
    logoId: '',
    subTitle: '',
    abstractText: '',
    statusTag: '',
    status: 'DRAFT',
    detailLink: '',
    visible: 1,
    sortOrder: '',
    version: 0,
  }
}

function fillForm(values) {
  Object.assign(form, emptyForm(), values)
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const result = Number(value)
  return Number.isFinite(result) ? result : null
}

function getLogoId(product) {
  return product.logo?.id ?? ''
}

function resetForm() {
  editingProductId.value = null
  fillForm({})
  errorMessage.value = ''
  successMessage.value = ''
}

function editProduct(product) {
  editingProductId.value = product.id
  fillForm({
    name: product.name || '',
    logoId: getLogoId(product),
    subTitle: product.subTitle || '',
    abstractText: product.abstractText || '',
    statusTag: product.statusTag || '',
    status: product.status || 'DRAFT',
    detailLink: product.detailLink || '',
    visible: product.visible ?? 1,
    sortOrder: product.sortOrder ?? '',
    version: product.version ?? 0,
  })
  errorMessage.value = ''
  successMessage.value = ''
}

function buildPayload() {
  return {
    name: form.name,
    logoId: toNumberOrNull(form.logoId),
    subTitle: form.subTitle,
    abstractText: form.abstractText,
    statusTag: form.statusTag,
    status: form.status,
    detailLink: form.detailLink,
    visible: Number(form.visible),
    sortOrder: toNumberOrNull(form.sortOrder),
  }
}

function validateForm(payload) {
  if (!payload.name) return '产品名称不能为空'
  if (!payload.logoId) return 'Logo 媒体 ID 不能为空'
  if (!payload.abstractText) return '产品摘要不能为空'
  return ''
}

async function loadProducts() {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await getAdminProducts({ pageNo: 1, pageSize })
    products.value = Array.isArray(data.list) ? data.list : []
    page.total = Number(data.total || 0)
    page.pageNo = data.pageNo || 1
    page.pageSize = data.pageSize || pageSize
  } catch (error) {
    errorMessage.value = error?.message || '读取产品列表失败'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  const payload = buildPayload()
  const validationMessage = validateForm(payload)

  if (validationMessage) {
    errorMessage.value = validationMessage
    return
  }

  saving.value = true

  try {
    if (editingProductId.value) {
      await updateAdminProduct(editingProductId.value, {
        ...payload,
        version: form.version,
      })
      successMessage.value = '产品已更新'
    } else {
      await createAdminProduct(payload)
      successMessage.value = '产品已新增'
    }

    resetForm()
    await loadProducts()
  } catch (error) {
    errorMessage.value = error?.message || '保存产品失败'
  } finally {
    saving.value = false
  }
}

async function handleDelete(product) {
  if (!window.confirm(`确认删除产品「${product.name}」？`)) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await deleteAdminProduct(product.id, product.version)
    successMessage.value = '产品已删除'
    await loadProducts()
  } catch (error) {
    errorMessage.value = error?.message || '删除产品失败'
  }
}

async function handleSaveSort() {
  if (!canSaveSort.value) return

  sortSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await sortAdminProducts(products.value.map((product) => ({
      id: product.id,
      sortOrder: Number(product.sortOrder) || 0,
    })))
    successMessage.value = '排序已保存'
    await loadProducts()
  } catch (error) {
    errorMessage.value = error?.message || '保存排序失败'
  } finally {
    sortSaving.value = false
  }
}

async function changeProductStatus(product, status) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await updateAdminProductStatus(product.id, status, product.version)
    successMessage.value = `产品已${statusLabel(status)}`
    await loadProducts()
  } catch (error) {
    errorMessage.value = error?.message || '更新发布状态失败'
  }
}

function statusLabel(status) {
  const labels = {
    DRAFT: '草稿',
    PUBLISHED: '发布',
    OFFLINE: '下线',
  }
  return labels[status] || status || '-'
}

function statusClass(status) {
  return String(status || 'DRAFT').toLowerCase()
}

onMounted(loadProducts)
</script>

<style scoped>
.product-manage {
  display: grid;
  gap: 18px;
}

.product-manage__toolbar,
.product-manage__form,
.product-manage__list {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.product-manage__toolbar,
.product-manage__list header,
.product-manage__form header,
.product-manage__form-actions,
.product-manage__toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.product-manage h2,
.product-manage h3,
.product-manage p {
  margin: 0;
}

.product-manage h2 {
  color: #111827;
  font-size: 22px;
}

.product-manage h3 {
  color: #111827;
  font-size: 18px;
}

.product-manage p,
.product-manage header span {
  margin-top: 8px;
  color: #64748b;
}

.product-manage__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.product-manage__wide {
  grid-column: 1 / -1;
}

.product-manage label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 800;
}

.product-manage input,
.product-manage textarea,
.product-manage select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.product-manage input,
.product-manage select {
  height: 38px;
  padding: 0 10px;
}

.product-manage textarea {
  min-height: 92px;
  padding: 10px;
  resize: vertical;
}

.product-manage__form-actions {
  margin-top: 18px;
}

.product-manage a {
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.product-manage button {
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

.product-manage button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.product-manage button.is-danger {
  background: #dc2626;
}

.product-manage table {
  width: 100%;
  margin-top: 18px;
  border-collapse: collapse;
}

.product-manage th,
.product-manage td {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: top;
}

.product-manage th {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.product-manage td strong,
.product-manage td span,
.product-manage td small {
  display: block;
}

.product-manage td span,
.product-manage td small {
  margin-top: 5px;
  color: #64748b;
}

.product-manage td img {
  display: block;
  width: 64px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  object-fit: contain;
}

.product-manage__sort {
  width: 86px;
}

.product-manage__status {
  width: max-content;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 900;
}

.product-manage__status.is-visible {
  background: #dcfce7;
  color: #047857;
}

.product-manage__content-status {
  width: max-content;
  margin-top: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 900;
}

.product-manage__content-status.draft {
  background: #fef3c7;
  color: #92400e;
}

.product-manage__content-status.published {
  background: #dcfce7;
  color: #166534;
}

.product-manage__content-status.offline {
  background: #e2e8f0;
  color: #475569;
}

.product-manage__empty,
.product-manage__hint {
  margin-top: 18px;
  padding: 16px;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
}

.product-manage__error,
.product-manage__success {
  padding: 12px 14px;
  border-radius: 8px;
  font-weight: 800;
}

.product-manage__error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.product-manage__success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}

@media (max-width: 980px) {
  .product-manage__toolbar,
  .product-manage__list header,
  .product-manage__form header,
  .product-manage__form-actions,
  .product-manage__toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .product-manage__grid {
    grid-template-columns: 1fr;
  }

  .product-manage table {
    display: block;
    overflow-x: auto;
  }
}
</style>
