<template>
  <main class="admin-login">
    <section class="admin-login__panel">
      <p class="admin-login__eyebrow">武汉云台官网后台</p>
      <h1>管理员登录</h1>

      <form class="admin-login__form" @submit.prevent="handleSubmit">
        <label>
          <span>用户名</span>
          <input v-model.trim="form.username" autocomplete="username" :disabled="submitting" />
        </label>

        <label>
          <span>密码</span>
          <input v-model="form.password" type="password" autocomplete="current-password" :disabled="submitting" />
        </label>

        <p v-if="errorMessage" class="admin-login__error">{{ errorMessage }}</p>
        <button type="submit" :disabled="submitting">{{ submitting ? '登录中...' : '登录' }}</button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminLogin, getAdminCsrf, getAdminMe } from '../api/adminAuth'

const route = useRoute()
const router = useRouter()
const submitting = ref(false)
const errorMessage = ref('')
const form = reactive({
  username: '',
  password: '',
})

function getRedirectPath() {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/admin') ? redirect : '/admin'
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.username || !form.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  submitting.value = true

  try {
    await adminLogin({
      username: form.username,
      password: form.password,
    })
    await getAdminMe()
    await getAdminCsrf()
    void router.replace(getRedirectPath())
  } catch (error) {
    errorMessage.value = error?.message || '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await getAdminMe()
    await router.replace(getRedirectPath())
  } catch {
    // Not logged in is the normal state for the login page.
  }
})
</script>

<style scoped>
.admin-login,
.admin-auth-home {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: #f4f6f8;
  color: #1f2937;
}

.admin-login__panel,
.admin-auth-home__panel {
  width: min(100%, 420px);
  padding: 32px;
  background: #fff;
  border: 1px solid #d9dee6;
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.admin-login__eyebrow,
.admin-auth-home__eyebrow {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.admin-login h1,
.admin-auth-home h1 {
  margin: 0 0 24px;
  font-size: 28px;
  line-height: 1.2;
}

.admin-login__form {
  display: grid;
  gap: 18px;
}

.admin-login label {
  display: grid;
  gap: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
}

.admin-login input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
}

.admin-login input:focus {
  border-color: #2563eb;
  outline: 2px solid rgba(37, 99, 235, 0.16);
}

.admin-login button,
.admin-auth-home__button {
  height: 42px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.admin-login button:disabled,
.admin-auth-home__button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.admin-login__error,
.admin-auth-home__error {
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
}

.admin-auth-home__meta {
  margin: -10px 0 24px;
  color: #475569;
}
</style>
