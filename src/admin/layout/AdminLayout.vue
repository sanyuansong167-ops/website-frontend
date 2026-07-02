<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-layout__main">
      <AdminHeader :title="pageTitle" :user="currentUser" :logging-out="loggingOut" @logout="handleLogout" />
      <main class="admin-layout__content">
        <p v-if="errorMessage" class="admin-layout__error">{{ errorMessage }}</p>
        <RouterView :current-user="currentUser" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { adminLogout, clearAdminCsrf, getAdminMe } from '../api/adminAuth'
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'

const route = useRoute()
const router = useRouter()
const currentUser = ref(null)
const loggingOut = ref(false)
const errorMessage = ref('')
const pageTitle = computed(() => route.meta?.title || '工作台')

async function loadCurrentUser() {
  try {
    currentUser.value = await getAdminMe()
  } catch (error) {
    errorMessage.value = error?.message || '登录状态校验失败'
    router.replace({ path: '/admin/login', query: { redirect: route.fullPath } })
  }
}

async function handleLogout() {
  loggingOut.value = true
  errorMessage.value = ''

  try {
    await adminLogout()
  } catch (error) {
    errorMessage.value = error?.message || '退出登录失败'
  } finally {
    clearAdminCsrf()
    loggingOut.value = false
    router.replace('/admin/login')
  }
}

onMounted(loadCurrentUser)
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6f8;
  color: #1f2937;
}

.admin-layout__main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.admin-layout__content {
  flex: 1;
  min-width: 0;
  padding: 24px 28px 32px;
}

.admin-layout__error {
  margin: 0 0 16px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
}
</style>
