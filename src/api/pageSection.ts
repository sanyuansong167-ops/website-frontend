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
    capabilityDescriptions: [
      '帮助大型组织实现集团化、标准化与精细化运营',
      '打通多源数据与业务流程，构建统一的数据资产体系',
      '推动 AI 进入真实业务场景',
    ],
  },
  aiCapability: {
    tag: 'AI战略',
    title: '从数字化到智能化',
    description: '云台数据正在从系统建设走向智能协同。十余年的行业经验、业务系统和数据资产积累，让AI具备真实落地的基础。',
  },
  innovation: {
    tag: '创新研发体系',
    title: '技术创新与行业应用并重',
    description: '持续推动前沿技术与产业场景深度融合',
    cooperationTitle: '产学研合作',
    cooperationDescription: '围绕人工智能、数据治理、行业数字化与智能体应用开展联合研究与成果转化',
    researchTitle: '重点研发方向',
  },
  cases: {
    tag: '产品与行业方案',
    title: '聚焦典型行业场景',
    description: '推动数字化与智能化价值落地',
    customerTitle: '典型客户',
    customerSubtitle: '与标杆案例',
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
    contactNameLabel: '姓名',
    contactNamePlaceholder: '您的姓名',
    companyNameLabel: '公司',
    companyNamePlaceholder: '公司名称',
    emailLabel: '邮箱',
    emailPlaceholder: 'your@email.com',
    phoneLabel: '电话',
    phonePlaceholder: '联系电话',
    demandLabel: '需求描述',
    demandPlaceholder: '请简要描述您的需求...',
    submitText: '提交预约',
    submittingText: '提交中...',
    successMessage: '提交成功，我们会尽快与您联系',
    failureMessage: '提交失败，请稍后重试',
    contactNameRequiredMessage: '请填写姓名',
    contactNameMaxMessage: '姓名不能超过64个字符',
    companyNameRequiredMessage: '请填写公司名称',
    companyNameMaxMessage: '公司名称不能超过128个字符',
    emailRequiredMessage: '请填写邮箱',
    emailMaxMessage: '邮箱不能超过128个字符',
    emailInvalidMessage: '请填写正确的邮箱',
    phoneMaxMessage: '联系电话不能超过64个字符',
    phoneInvalidMessage: '联系电话格式不正确',
    demandMaxMessage: '需求描述不能超过1000个字符',
  },
}

export const productDetailPageSectionFallbacks = {
  hero: {
    tag: '产品详情',
    description: '真实贴合行业业务场景的云台生产产品。',
  },
  states: {
    loadingText: '正在加载产品详情...',
    notFoundText: '未找到对应产品，可能已下线或链接已失效。',
    emptyContentText: '暂无更多详情内容。',
    emptyDetailText: '暂无产品详情。',
    updatedAtPrefix: '更新于',
  },
  recommendations: {
    relatedCasesTitle: '相关案例',
    relatedIndustrySolutionsTitle: '相关行业方案',
  },
  seo: {
    defaultTitle: '产品详情',
    titleSuffix: '武汉云台数据',
  },
}

export const caseDetailPageSectionFallbacks = {
  hero: {
    tag: '案例详情',
    description: '运行在企业真实场景中的客户案例。',
  },
  states: {
    loadingText: '正在加载案例详情...',
    notFoundText: '未找到对应案例，可能已下线或链接已失效。',
    emptyContentText: '暂无更多详情内容。',
    emptyDetailText: '暂无案例详情。',
  },
  recommendations: {
    relatedProductsTitle: '相关产品',
    recommendedCasesTitle: '相关推荐案例',
  },
  seo: {
    defaultTitle: '案例详情',
    titleSuffix: '武汉云台数据',
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
