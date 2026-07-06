<template>
  <section class="page-section">
    <header class="page-section__header">
      <div>
        <p>内容运营</p>
        <h2>页面区块</h2>
      </div>
      <button type="button" @click="openCreate">新增区块</button>
    </header>

    <div class="page-section__toolbar">
      <label>
        页面编码
        <input v-model.trim="filters.pageCode" placeholder="home" @keyup.enter="reloadFirstPage" />
      </label>
      <button type="button" class="page-section__ghost" :disabled="loading" @click="reloadFirstPage">
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
      <button type="button" class="page-section__ghost" :disabled="saving || rows.length === 0" @click="saveSort">
        保存排序
      </button>
    </div>

    <p v-if="message" class="page-section__message">{{ message }}</p>
    <p v-if="errorMessage" class="page-section__error">{{ errorMessage }}</p>

    <div class="page-section__table">
      <table>
        <thead>
          <tr>
            <th>页面 / 区块</th>
            <th>标题</th>
            <th>排序</th>
            <th>显示</th>
            <th>发布状态</th>
            <th>版本</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!loading && rows.length === 0">
            <td colspan="7" class="page-section__empty">暂无页面区块</td>
          </tr>
          <tr v-for="item in rows" :key="item.id">
            <td>
              <strong>{{ item.pageCode }}</strong>
              <small>{{ item.sectionCode }}</small>
            </td>
            <td>
              <strong>{{ item.title }}</strong>
              <small>{{ item.subtitle || item.description || '-' }}</small>
            </td>
            <td>
              <input v-model.number="sortDraft[item.id]" class="page-section__sort-input" type="number" min="0" />
            </td>
            <td>
              <label class="page-section__switch">
                <input type="checkbox" :checked="item.visible" @change="toggleVisibility(item)" />
                <span>{{ item.visible ? '显示' : '隐藏' }}</span>
              </label>
            </td>
            <td>
              <span :class="['page-section__status', item.status.toLowerCase()]">{{ statusLabel(item.status) }}</span>
            </td>
            <td>{{ item.version }}</td>
            <td>
              <div class="page-section__actions">
                <button type="button" class="page-section__ghost" @click="openEdit(item)">编辑</button>
                <button type="button" class="page-section__danger" @click="deleteSection(item)">删除</button>
              </div>
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="7" class="page-section__empty">加载中...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="page-section__pagination">
      <span>共 {{ total }} 条，第 {{ pageNo }} 页</span>
      <div>
        <button type="button" class="page-section__ghost" :disabled="pageNo <= 1 || loading" @click="changePage(pageNo - 1)">
          上一页
        </button>
        <button type="button" class="page-section__ghost" :disabled="pageNo >= totalPages || loading" @click="changePage(pageNo + 1)">
          下一页
        </button>
      </div>
    </footer>

    <div v-if="dialogOpen" class="page-section__modal" role="dialog" aria-modal="true">
      <form class="page-section__dialog" @submit.prevent="submitForm">
        <header>
          <h3>{{ editing ? '编辑区块' : '新增区块' }}</h3>
          <button type="button" class="page-section__ghost" @click="closeDialog">关闭</button>
        </header>
        <div class="page-section__form-grid">
          <label>
            pageCode
            <input v-model.trim="form.pageCode" required maxlength="64" placeholder="home" />
          </label>
          <label>
            sectionCode
            <input v-model.trim="form.sectionCode" required maxlength="64" placeholder="hero" />
          </label>
          <label>
            title
            <input v-model.trim="form.title" required maxlength="160" />
          </label>
          <label>
            subtitle
            <input v-model.trim="form.subtitle" maxlength="255" />
          </label>
          <label>
            sortOrder
            <input v-model.number="form.sortOrder" type="number" min="0" />
          </label>
          <label>
            status
            <select v-model="form.status">
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已发布</option>
              <option value="OFFLINE">已下线</option>
            </select>
          </label>
        </div>
        <label>
          description
          <textarea v-model.trim="form.description" maxlength="1000" />
        </label>
        <label>
          contentJson
          <textarea v-model="form.contentJson" class="page-section__json" spellcheck="false" />
        </label>
        <label class="page-section__checkbox">
          <input v-model="form.visible" type="checkbox" />
          <span>显示</span>
        </label>
        <footer>
          <button type="button" class="page-section__ghost" @click="closeDialog">取消</button>
          <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </footer>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  batchSortAdminPageSections,
  createAdminPageSection,
  deleteAdminPageSection,
  listAdminPageSections,
  type AdminPageSection,
  type PageSectionPayload,
  updateAdminPageSection,
  updateAdminPageSectionVisibility,
} from '../api/adminPageSection'

const rows = ref<AdminPageSection[]>([])
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const errorMessage = ref('')
const dialogOpen = ref(false)
const editing = ref<AdminPageSection | null>(null)
const pageNo = ref(1)
const pageSize = ref(20)
const total = ref(0)
const sortDraft = reactive<Record<number, number>>({})
const filters = reactive({ pageCode: 'home' })
const form = reactive({
  pageCode: 'home',
  sectionCode: '',
  title: '',
  subtitle: '',
  description: '',
  contentJson: '{}',
  sortOrder: 10,
  visible: true,
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'OFFLINE',
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

onMounted(loadData)

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listAdminPageSections({
      pageCode: filters.pageCode || undefined,
      pageNo: pageNo.value,
      pageSize: pageSize.value,
    })
    rows.value = result.list || []
    total.value = Number(result.total || 0)
    rows.value.forEach((item) => {
      sortDraft[item.id] = item.sortOrder
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取页面区块失败'
  } finally {
    loading.value = false
  }
}

async function reloadFirstPage() {
  pageNo.value = 1
  await loadData()
}

async function changePage(nextPage: number) {
  pageNo.value = Math.min(Math.max(1, nextPage), totalPages.value)
  await loadData()
}

function openCreate() {
  editing.value = null
  Object.assign(form, {
    pageCode: filters.pageCode || 'home',
    sectionCode: '',
    title: '',
    subtitle: '',
    description: '',
    contentJson: '{}',
    sortOrder: nextSortOrder(),
    visible: true,
    status: 'DRAFT',
  })
  dialogOpen.value = true
}

function openEdit(item: AdminPageSection) {
  editing.value = item
  Object.assign(form, {
    pageCode: item.pageCode,
    sectionCode: item.sectionCode,
    title: item.title,
    subtitle: item.subtitle || '',
    description: item.description || '',
    contentJson: item.contentJson || '{}',
    sortOrder: item.sortOrder,
    visible: item.visible,
    status: item.status as 'DRAFT' | 'PUBLISHED' | 'OFFLINE',
  })
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

async function submitForm() {
  if (!isValidJson(form.contentJson)) {
    errorMessage.value = 'contentJson 必须是合法 JSON'
    return
  }
  saving.value = true
  errorMessage.value = ''
  try {
    const payload: PageSectionPayload = {
      version: editing.value?.version,
      pageCode: form.pageCode,
      sectionCode: form.sectionCode,
      title: form.title,
      subtitle: form.subtitle || null,
      description: form.description || null,
      contentJson: form.contentJson || null,
      sortOrder: Number(form.sortOrder || 0),
      visible: form.visible,
      status: form.status,
    }
    if (editing.value) {
      await updateAdminPageSection(editing.value.id, payload)
      message.value = '保存成功'
    } else {
      await createAdminPageSection(payload)
      message.value = '新增成功'
    }
    closeDialog()
    await loadData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存页面区块失败'
  } finally {
    saving.value = false
  }
}

async function toggleVisibility(item: AdminPageSection) {
  errorMessage.value = ''
  try {
    await updateAdminPageSectionVisibility(item.id, !item.visible, item.version)
    message.value = '显示状态已更新'
    await loadData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '更新显示状态失败'
  }
}

async function saveSort() {
  saving.value = true
  errorMessage.value = ''
  try {
    await batchSortAdminPageSections(rows.value.map((item) => ({
      id: item.id,
      sortOrder: Number(sortDraft[item.id] ?? item.sortOrder),
    })))
    message.value = '排序已保存'
    await loadData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存排序失败'
  } finally {
    saving.value = false
  }
}

async function deleteSection(item: AdminPageSection) {
  if (!window.confirm(`确认删除区块「${item.title}」？`)) return
  errorMessage.value = ''
  try {
    await deleteAdminPageSection(item.id, item.version)
    message.value = '删除成功'
    await loadData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '删除页面区块失败'
  }
}

function nextSortOrder() {
  const maxSort = rows.value.reduce((max, item) => Math.max(max, Number(item.sortOrder || 0)), 0)
  return maxSort + 10
}

function isValidJson(value: string) {
  if (!value.trim()) return true
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    OFFLINE: '已下线',
  }
  return labels[status] || status
}
</script>

<style scoped>
.page-section {
  display: grid;
  gap: 18px;
}

.page-section__header,
.page-section__toolbar,
.page-section__table,
.page-section__pagination {
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
}

.page-section__header,
.page-section__toolbar,
.page-section__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.page-section__header p,
.page-section__header h2 {
  margin: 0;
}

.page-section__header p {
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.page-section__header h2 {
  margin-top: 4px;
  color: #111827;
  font-size: 22px;
}

.page-section button {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.page-section button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.page-section__ghost {
  border: 1px solid #cbd5e1 !important;
  background: #fff !important;
  color: #334155 !important;
}

.page-section__danger {
  background: #dc2626 !important;
}

.page-section label {
  display: grid;
  gap: 6px;
  color: #334155;
  font-weight: 800;
}

.page-section input,
.page-section select,
.page-section textarea {
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #111827;
  font: inherit;
}

.page-section textarea {
  min-height: 92px;
  padding: 10px;
  resize: vertical;
}

.page-section__json {
  min-height: 150px;
  font-family: Consolas, monospace;
}

.page-section__message,
.page-section__error {
  margin: 0;
  font-weight: 800;
}

.page-section__message {
  color: #047857;
}

.page-section__error {
  color: #b91c1c;
}

.page-section__table {
  overflow-x: auto;
}

.page-section table {
  width: 100%;
  border-collapse: collapse;
}

.page-section th,
.page-section td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  text-align: left;
  vertical-align: middle;
}

.page-section th {
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.page-section td strong,
.page-section td small {
  display: block;
  overflow-wrap: anywhere;
}

.page-section td strong {
  color: #111827;
}

.page-section td small {
  margin-top: 5px;
  color: #64748b;
}

.page-section__sort-input {
  width: 86px;
}

.page-section__switch {
  display: inline-flex !important;
  grid-template-columns: none !important;
  align-items: center;
  gap: 8px;
}

.page-section__switch input,
.page-section__checkbox input {
  min-height: auto;
}

.page-section__status {
  display: inline-flex;
  min-width: 64px;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.page-section__status.draft {
  background: #fef3c7;
  color: #92400e;
}

.page-section__status.published {
  background: #dcfce7;
  color: #166534;
}

.page-section__status.offline {
  background: #e2e8f0;
  color: #475569;
}

.page-section__actions,
.page-section__pagination div {
  display: flex;
  gap: 8px;
}

.page-section__empty {
  padding: 28px !important;
  color: #64748b;
  text-align: center !important;
}

.page-section__modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgb(15 23 42 / 0.45);
}

.page-section__dialog {
  display: grid;
  gap: 14px;
  width: min(100%, 760px);
  max-height: calc(100vh - 36px);
  overflow: auto;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
}

.page-section__dialog header,
.page-section__dialog footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-section__dialog h3 {
  margin: 0;
  color: #111827;
}

.page-section__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.page-section__checkbox {
  display: flex !important;
  flex-direction: row;
  align-items: center;
}

@media (max-width: 760px) {
  .page-section__header,
  .page-section__toolbar,
  .page-section__pagination,
  .page-section__dialog header,
  .page-section__dialog footer {
    align-items: stretch;
    flex-direction: column;
  }

  .page-section__form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
