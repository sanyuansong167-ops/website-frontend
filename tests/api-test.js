const API_BASE_URL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456'

const cookieJar = new Map()
let csrfToken = null

function fullUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`
}

function saveCookies(response) {
  const setCookie = response.headers.getSetCookie ? response.headers.getSetCookie() : response.headers.get('set-cookie')
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : []

  for (const cookie of cookies) {
    const [pair] = cookie.split(';')
    const index = pair.indexOf('=')
    if (index > 0) cookieJar.set(pair.slice(0, index), pair.slice(index + 1))
  }
}

function cookieHeader() {
  return Array.from(cookieJar.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}

async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(cookieJar.size ? { Cookie: cookieHeader() } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(fullUrl(path), {
    ...options,
    headers,
  })
  saveCookies(response)

  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()
  const data = contentType.includes('application/json') && text ? JSON.parse(text) : text

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }

  if (data && typeof data === 'object' && 'code' in data && ![0, 200, '0', '200', 'success'].includes(data.code)) {
    throw new Error(`business code ${data.code}: ${data.message || data.msg || JSON.stringify(data)}`)
  }

  return data && typeof data === 'object' && 'data' in data ? data.data : data
}

async function runCase(name, fn) {
  try {
    const value = await fn()
    console.log(`SUCCESS ${name}`)
    return { name, ok: true, value }
  } catch (error) {
    console.log(`FAIL ${name} ${error.message}`)
    return { name, ok: false, error: error.message }
  }
}

async function getCsrf() {
  csrfToken = await request('/admin/api/auth/csrf')
  if (!csrfToken?.token || !csrfToken?.headerName) throw new Error('missing csrf token/headerName')
  return csrfToken
}

function csrfHeaders() {
  if (!csrfToken?.token || !csrfToken?.headerName) throw new Error('csrf token not loaded')
  return { [csrfToken.headerName]: csrfToken.token }
}

async function main() {
  const results = []

  results.push(await runCase('csrf GET /admin/api/auth/csrf', getCsrf))
  results.push(
    await runCase('login POST /admin/api/auth/login', () =>
      request('/admin/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
      }),
    ),
  )
  results.push(await runCase('me GET /admin/api/auth/me', () => request('/admin/api/auth/me')))

  const portalGetPaths = [
    '/portal/api/products',
    '/portal/api/cases',
    '/portal/api/contact-info',
    '/portal/api/site/config',
    '/portal/api/site/home-banner',
    '/portal/api/site/home-metrics',
    '/portal/api/site/honors',
    '/portal/api/site/navigation',
    '/portal/api/site/ai-cards',
    '/portal/api/site/capabilities',
    '/portal/api/site/client-logos',
    '/portal/api/site/strength-metrics',
    '/portal/api/partner-universities',
    '/portal/api/timeline-events',
    '/portal/api/research-directions',
    '/portal/api/value-cards',
    '/portal/api/our-promises',
    '/portal/api/industry-solutions',
    '/portal/api/cooperation-direction-tags',
  ]

  for (const path of portalGetPaths) {
    results.push(await runCase(`portal GET ${path}`, () => request(path)))
  }

  results.push(
    await runCase('lead submit POST /portal/api/leads', () =>
      request('/portal/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: `API联调${Date.now()}`,
          company: '武汉云台接口联调',
          email: `api-test-${Date.now()}@example.com`,
          phone: '13800138000',
          demandDescription: '真实接口联调脚本提交，用于验证 Lead 可入库。',
        }),
      }),
    ),
  )

  results.push(await runCase('admin products GET /admin/api/products', () => request('/admin/api/products')))
  results.push(await runCase('admin cases GET /admin/api/cases', () => request('/admin/api/cases')))
  results.push(await runCase('admin site config GET /admin/api/site/config', () => request('/admin/api/site/config')))

  results.push(await runCase('refresh csrf GET /admin/api/auth/csrf', getCsrf))
  results.push(
    await runCase('logout POST /admin/api/auth/logout', () =>
      request('/admin/api/auth/logout', {
        method: 'POST',
        headers: csrfHeaders(),
      }),
    ),
  )

  const failed = results.filter((item) => !item.ok)
  console.log(`\nSUMMARY ${results.length - failed.length}/${results.length} SUCCESS`)

  if (failed.length) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(`FAIL api-test ${error.stack || error.message}`)
  process.exitCode = 1
})
