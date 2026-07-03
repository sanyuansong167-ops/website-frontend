import http, { unwrapApiData } from '../../api/http'
import { requestAdminWithCsrf } from './adminAuth'

export type AdminProduct = {
  id: number
  name: string
  logo?: {
    id?: number
    url?: string
    fileName?: string
  } | null
  subTitle: string
  abstractText: string
  statusTag: string
  detailLink: string
  visible: number
  sortOrder: number
  version: number
}

export type ProductPageResult = {
  list: AdminProduct[]
  total: number
  pageNo: number
  pageSize: number
}

export type ProductPayload = {
  name: string
  logoId: number
  subTitle: string
  abstractText: string
  statusTag: string
  detailLink: string
  visible: number
  sortOrder: number | null
  version?: number
}

export async function getAdminProducts(params: { pageNo?: number; pageSize?: number } = {}) {
  const response = await http.get('/admin/api/products', {
    params: {
      pageNo: params.pageNo ?? 1,
      pageSize: params.pageSize ?? 100,
    },
  })
  return unwrapApiData<ProductPageResult>(response.data)
}

export async function createAdminProduct(payload: ProductPayload) {
  return requestAdminWithCsrf<number>('post', '/admin/api/products', payload)
}

export async function updateAdminProduct(id: number, payload: ProductPayload & { version: number }) {
  return requestAdminWithCsrf<void>('put', `/admin/api/products/${id}`, payload)
}

export async function deleteAdminProduct(id: number, version: number) {
  return requestAdminWithCsrf<void>('delete', `/admin/api/products/${id}`, undefined, { params: { version } })
}

export async function sortAdminProducts(sortItems: { id: number; sortOrder: number }[]) {
  return requestAdminWithCsrf<void>('put', '/admin/api/products/batch-sort', sortItems)
}
