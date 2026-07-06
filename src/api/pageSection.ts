import http, { getApiErrorMessage, unwrapApiData } from './http'

export type PortalPageSection = {
  id: number
  pageCode: string
  sectionCode: string
  title: string
  subtitle?: string | null
  description?: string | null
  contentJson?: string | null
  sortOrder: number
  visible: boolean
  status: string
  version: number
}

export const homePageSectionFallbacks = {
  hero: {
    pill: '国家高新技术企业 · 湖北省人工智能企业',
  },
  products: {
    tag: '产品体系',
    title: '从能力底座到产品矩阵',
    description: '三层架构覆盖企业数字化全链路，五大产品让每一层能力都可落地',
    baseTitle: '能力底座',
    matrixTitle: '产品矩阵',
  },
  aiCapability: {
    tag: 'AI战略',
    title: '从数字化到智能化',
    description: '云台数据正在从系统建设走向智能协同。十余年的行业经验、业务系统和数据资产积累，让AI具备真实落地的基础。',
  },
  about: {
    tag: '关于我们',
    title: '十余年深耕，持续成长',
    strengthTitle: '十余年的行业积累，是云台数据持续创新的基础',
    valuesTitle: '核心价值观',
    promiseTitle: '我们的承诺',
  },
  contact: {
    tag: '联系我们',
    title: '期待与您共同探索未来',
    description: '无论您正在规划数字化转型、建设数据平台，还是探索人工智能应用落地',
    cardTitle: '联系方式',
    addressLabel: '地址',
    phoneLabel: '商务咨询',
    emailLabel: '邮箱联系',
    cooperationTitle: '合作方向',
  },
  cta: {
    primaryText: '了解解决方案',
    primaryHref: '#cases',
    secondaryText: '预约交流',
    secondaryHref: '#contact',
    aiText: '探索AI智能体解决方案',
    aiHref: '#contact',
    formTitle: '预约交流',
    submitText: '提交预约',
    submittingText: '提交中...',
    successMessage: '提交成功，我们会尽快与您联系',
    failureMessage: '提交失败，请稍后重试',
  },
}

export async function getPortalPageSections(pageCode = 'home') {
  try {
    const response = await http.get('/portal/api/site/page-sections', { params: { pageCode } })
    return unwrapApiData<PortalPageSection[]>(response.data)
  } catch (error) {
    throw new Error(getApiErrorMessage(error, '获取页面区块失败'))
  }
}
