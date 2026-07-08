export type SiteModuleFieldType = 'text' | 'number' | 'textarea' | 'switch' | 'media-id'

export type SiteModuleColumnType = 'text' | 'media' | 'description' | 'switch' | 'date' | 'sort'

export type SiteModuleFieldConfig = {
  key: string
  label: string
  type: SiteModuleFieldType
  required?: boolean
  maxLength?: number
  min?: number
  placeholder?: string
  disabled?: boolean
  submit?: boolean
  valueFromRow?: (row: Record<string, unknown>) => unknown
  submitValue?: (value: unknown) => unknown
  defaultValue?: unknown
  previewKey?: string
}

export type SiteModuleColumnConfig = {
  key: string
  label: string
  type?: SiteModuleColumnType
  mediaKey?: string
}

export type SiteModuleCustomActionConfig = {
  key: string
  label: string
  variant?: 'primary' | 'danger' | 'ghost'
}

export type SiteModuleFormConfig = {
  key: string
  title: string
  idField: string
  versionField: string
  listMode: 'array' | 'page-records' | 'singleton' | 'tree' | 'tree-items'
  emptyText: string
  api: {
    list: string
    create?: string
    update?: string
    delete?: string
  }
  delete: {
    mode: 'query' | 'body'
  }
  visibility: {
    enabled: boolean
    field: string
    mode: 'update'
  }
  reorder: {
    enabled: boolean
    path?: string
    method?: 'post' | 'put'
    mode: 'sort-items' | 'ordered-ids'
    sortField?: string
    orderedIdsField?: string
  }
  columns: SiteModuleColumnConfig[]
  fields: SiteModuleFieldConfig[]
  customActions?: SiteModuleCustomActionConfig[]
}

function mediaValue(row: Record<string, unknown>, mediaKey: string, field: 'id' | 'url') {
  const media = row[mediaKey]
  if (media && typeof media === 'object' && !Array.isArray(media)) {
    return (media as Record<string, unknown>)[field]
  }
  return row[`${mediaKey}${field === 'id' ? 'Id' : 'Url'}`]
}

function splitTags(value: unknown) {
  if (Array.isArray(value)) return value
  return String(value || '')
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export const siteModuleFormConfigs: Record<string, SiteModuleFormConfig> = {
  'ai-cards': {
    key: 'ai-cards',
    title: 'AI 卡片',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无 AI 卡片',
    api: {
      list: '/admin/api/site/ai-cards',
      create: '/admin/api/site/ai-cards',
      update: '/admin/api/site/ai-cards/{id}',
      delete: '/admin/api/site/ai-cards/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/site/ai-cards/batch-sort',
      method: 'put',
      mode: 'sort-items',
      sortField: 'sortOrder',
    },
    columns: [
      { key: 'name', label: '名称' },
      { key: 'englishName', label: '英文名' },
      { key: 'icon', label: '图标', type: 'media', mediaKey: 'icon' },
      { key: 'description', label: '描述', type: 'description' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'name', label: '名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：企业知识库' },
      { key: 'englishName', label: '英文名', type: 'text', maxLength: 128, placeholder: '例如：Knowledge' },
      {
        key: 'iconId',
        label: '图标媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => mediaValue(row, 'icon', 'id'),
        previewKey: 'iconUrl',
      },
      { key: 'jumpLink', label: '跳转链接', type: 'text', maxLength: 256, placeholder: '/products 或 https://...' },
      { key: 'sortOrder', label: '排序', type: 'number', min: 0, placeholder: '数字越小越靠前' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        required: true,
        maxLength: 256,
        placeholder: '填写一句话业务描述',
      },
      {
        key: 'iconUrl',
        label: '图标预览',
        type: 'text',
        submit: false,
        valueFromRow: (row) => mediaValue(row, 'icon', 'url'),
      },
    ],
  },
  'client-logos': {
    key: 'client-logos',
    title: '客户 Logo',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无客户 Logo',
    api: {
      list: '/admin/api/site/client-logos',
      create: '/admin/api/site/client-logos',
      update: '/admin/api/site/client-logos/{id}',
      delete: '/admin/api/site/client-logos/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/site/client-logos/batch-sort',
      method: 'put',
      mode: 'sort-items',
      sortField: 'sortOrder',
    },
    columns: [
      { key: 'logo', label: 'Logo', type: 'media', mediaKey: 'logo' },
      { key: 'name', label: '客户名称' },
      { key: 'industry', label: '所属行业' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'name', label: '客户名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：武汉云台' },
      { key: 'industry', label: '所属行业', type: 'text', maxLength: 64, placeholder: '例如：教育、医疗、制造' },
      {
        key: 'logoId',
        label: 'Logo 媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => mediaValue(row, 'logo', 'id'),
        previewKey: 'logoUrl',
      },
      { key: 'sortOrder', label: '排序', type: 'number', min: 0, placeholder: '数字越小越靠前' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      {
        key: 'logoUrl',
        label: 'Logo 预览',
        type: 'text',
        submit: false,
        valueFromRow: (row) => mediaValue(row, 'logo', 'url'),
      },
    ],
  },
  honors: {
    key: 'honors',
    title: '荣誉资质',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',
    emptyText: '暂无荣誉资质',
    api: {
      list: '/admin/api/site/honors',
      create: '/admin/api/site/honors',
      update: '/admin/api/site/honors/{id}',
      delete: '/admin/api/site/honors/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/site/honors/batch-sort',
      method: 'put',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedHonorIds',
    },
    columns: [
      { key: 'icon', label: '图片', type: 'media', mediaKey: 'icon' },
      { key: 'name', label: '荣誉名称' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'name', label: '荣誉名称', type: 'text', required: true, maxLength: 120, placeholder: '例如：国家高新技术企业' },
      {
        key: 'iconId',
        label: '图片媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => row.iconId,
        previewKey: 'iconUrl',
      },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'iconUrl', label: '图片预览', type: 'text', submit: false, valueFromRow: (row) => row.iconUrl },
    ],
  },
  'timeline-events': {
    key: 'timeline-events',
    title: '时间线',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无时间线',
    api: {
      list: '/admin/api/timeline-events',
      create: '/admin/api/timeline-events',
      update: '/admin/api/timeline-events/{id}',
      delete: '/admin/api/timeline-events/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/timeline-events/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedTimelineEventIds',
    },
    columns: [
      { key: 'year', label: '年份' },
      { key: 'title', label: '标题' },
      { key: 'description', label: '描述', type: 'description' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'year', label: '年份', type: 'number', required: true, min: 1900, placeholder: '例如：2026' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'title', label: '标题', type: 'text', required: true, maxLength: 128, placeholder: '例如：完成平台升级' },
      {
        key: 'description',
        label: '描述',
        type: 'textarea',
        required: true,
        maxLength: 512,
        placeholder: '填写节点描述',
      },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
    ],
  },
  'capability-categories': {
    key: 'capability-categories',
    title: '能力底座分类',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',
    emptyText: '暂无能力底座分类',
    api: {
      list: '/admin/api/site/capability-categories',
      create: '/admin/api/site/capability-categories',
      update: '/admin/api/site/capability-categories/{id}',
      delete: '/admin/api/site/capability-categories/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/site/capability-categories/batch-sort',
      method: 'put',
      mode: 'sort-items',
      sortField: 'sortOrder',
    },
    columns: [
      { key: 'name', label: '分类名称' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'name', label: '分类名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：AI能力底座' },
      { key: 'sortOrder', label: '排序', type: 'number', min: 0, placeholder: '数字越小越靠前' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
    ],
  },
  'capability-items': {
    key: 'capability-items',
    title: '能力底座子项',
    idField: 'id',
    versionField: 'version',
    listMode: 'tree-items',
    emptyText: '暂无能力底座子项',
    api: {
      list: '/admin/api/site/capability-categories',
      create: '/admin/api/site/capability-items',
      update: '/admin/api/site/capability-items/{id}',
      delete: '/admin/api/site/capability-items/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/site/capability-items/batch-sort',
      method: 'put',
      mode: 'sort-items',
      sortField: 'sortOrder',
    },
    columns: [
      { key: 'categoryId', label: '分类ID' },
      { key: 'name', label: '子项名称' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'categoryId', label: '分类ID', type: 'number', required: true, min: 1, placeholder: '请输入所属分类 ID' },
      { key: 'name', label: '子项名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：知识库构建' },
      { key: 'sortOrder', label: '排序', type: 'number', min: 0, placeholder: '数字越小越靠前' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
    ],
  },
  'strength-metrics': {
    key: 'strength-metrics',
    title: '实力指标',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',
    emptyText: '暂无实力指标',
    api: {
      list: '/admin/api/site/strength-metrics',
      create: '/admin/api/site/strength-metrics',
      update: '/admin/api/site/strength-metrics/{id}',
      delete: '/admin/api/site/strength-metrics/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/site/strength-metrics/batch-sort',
      method: 'put',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedMetricIds',
    },
    columns: [
      { key: 'icon', label: '图标', type: 'media', mediaKey: 'icon' },
      { key: 'metricValue', label: '核心数值' },
      { key: 'label', label: '业务标签' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      {
        key: 'iconId',
        label: '图标媒体 ID',
        type: 'media-id',
        min: 1,
        placeholder: '可选，留空表示无图标',
        valueFromRow: (row) => row.iconId,
        previewKey: 'iconUrl',
      },
      { key: 'metricValue', label: '核心数值', type: 'text', required: true, maxLength: 64, placeholder: '例如：100+' },
      { key: 'label', label: '业务标签', type: 'text', required: true, maxLength: 128, placeholder: '例如：服务客户' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'iconUrl', label: '图标预览', type: 'text', submit: false, valueFromRow: (row) => row.iconUrl },
    ],
  },
  'partner-universities': {
    key: 'partner-universities',
    title: '合作高校',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',
    emptyText: '暂无合作高校',
    api: {
      list: '/admin/api/partner-universities',
      create: '/admin/api/partner-universities',
      update: '/admin/api/partner-universities/{id}',
      delete: '/admin/api/partner-universities/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/partner-universities/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedIds',
    },
    columns: [
      { key: 'logo', label: 'Logo', type: 'media', mediaKey: 'logo' },
      { key: 'name', label: '高校简称' },
      { key: 'fullName', label: '高校全称' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'name', label: '高校简称', type: 'text', required: true, maxLength: 100, placeholder: '例如：武大' },
      { key: 'fullName', label: '高校全称', type: 'text', required: true, maxLength: 200, placeholder: '例如：武汉大学' },
      {
        key: 'logoMediaId',
        label: 'Logo 媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => row.logoMediaId,
        previewKey: 'logoUrl',
      },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'logoUrl', label: 'Logo 预览', type: 'text', submit: false, valueFromRow: (row) => row.logoUrl },
    ],
  },
  'research-directions': {
    key: 'research-directions',
    title: '研发方向',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',
    emptyText: '暂无研发方向',
    api: {
      list: '/admin/api/research-directions',
      create: '/admin/api/research-directions',
      update: '/admin/api/research-directions/{id}',
      delete: '/admin/api/research-directions/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/research-directions/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedIds',
    },
    columns: [
      { key: 'icon', label: '图标', type: 'media', mediaKey: 'icon' },
      { key: 'titleCn', label: '中文标题' },
      { key: 'titleEn', label: '英文标题' },
      { key: 'summary', label: '描述', type: 'description' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'titleCn', label: '中文标题', type: 'text', required: true, maxLength: 100, placeholder: '例如：人工智能' },
      { key: 'titleEn', label: '英文标题', type: 'text', required: true, maxLength: 100, placeholder: '例如：AI Research' },
      {
        key: 'iconMediaId',
        label: '图标媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => row.iconMediaId,
        previewKey: 'iconUrl',
      },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'summary', label: '描述', type: 'textarea', required: true, maxLength: 512, placeholder: '填写研发方向描述' },
      { key: 'iconUrl', label: '图标预览', type: 'text', submit: false, valueFromRow: (row) => row.iconUrl },
    ],
  },
  'value-cards': {
    key: 'value-cards',
    title: '价值卡片',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无价值卡片',
    api: {
      list: '/admin/api/value-cards',
      create: '/admin/api/value-cards',
      update: '/admin/api/value-cards/{id}',
      delete: '/admin/api/value-cards/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/value-cards/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedValueCardIds',
    },
    columns: [
      { key: 'icon', label: '图标', type: 'media', mediaKey: 'icon' },
      { key: 'title', label: '标题' },
      { key: 'subtitle', label: '副标语' },
      { key: 'description', label: '描述', type: 'description' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      {
        key: 'iconMediaId',
        label: '图标媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => row.iconMediaId,
        previewKey: 'iconUrl',
      },
      { key: 'title', label: '标题', type: 'text', required: true, maxLength: 32, placeholder: '例如：可靠' },
      { key: 'subtitle', label: '副标语', type: 'text', required: true, maxLength: 128, placeholder: '填写副标语' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'description', label: '描述', type: 'textarea', required: true, maxLength: 512, placeholder: '填写价值描述' },
      { key: 'iconUrl', label: '图标预览', type: 'text', submit: false, valueFromRow: (row) => row.iconUrl },
    ],
  },
  'promise-content': {
    key: 'promise-content',
    title: '承诺内容',
    idField: 'id',
    versionField: 'version',
    listMode: 'singleton',
    emptyText: '暂无承诺内容',
    api: {
      list: '/admin/api/promise-content',
      update: '/admin/api/promise-content',
    },
    delete: { mode: 'query' },
    visibility: { enabled: false, field: 'visible', mode: 'update' },
    reorder: { enabled: false, mode: 'ordered-ids' },
    columns: [
      { key: 'content', label: '主体文案', type: 'description' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'content', label: '主体文案', type: 'textarea', required: true, maxLength: 2000, placeholder: '填写承诺内容' },
    ],
  },
  'content-tags': {
    key: 'content-tags',
    title: '内容标签',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无内容标签',
    api: {
      list: '/admin/api/content-tags',
      create: '/admin/api/content-tags',
      update: '/admin/api/content-tags/{id}',
      delete: '/admin/api/content-tags/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/content-tags/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedTagIds',
    },
    columns: [
      { key: 'tagCode', label: '标签编码' },
      { key: 'tagName', label: '标签名称' },
      { key: 'description', label: '说明', type: 'description' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'tagCode', label: '标签编码', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI、BIG_DATA、MEDICAL' },
      { key: 'tagName', label: '标签名称', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI、大数据、医疗' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'description', label: '说明', type: 'textarea', maxLength: 512, placeholder: '用于说明该标签适用的内容范围' },
    ],
  },
  'content-categories': {
    key: 'content-categories',
    title: '内容分类',
    idField: 'id',
    versionField: 'version',
    listMode: 'tree',
    emptyText: '暂无内容分类',
    api: {
      list: '/admin/api/content-categories',
      create: '/admin/api/content-categories',
      update: '/admin/api/content-categories/{id}',
      delete: '/admin/api/content-categories/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/content-categories/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedCategoryIds',
    },
    columns: [
      { key: 'treeName', label: '分类名称' },
      { key: 'categoryCode', label: '分类编码' },
      { key: 'parentName', label: '父级分类' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      {
        key: 'parentId',
        label: '父级分类 ID',
        type: 'number',
        min: 0,
        placeholder: '顶级分类留空或填 0',
        submitValue: (value) => {
          const numberValue = Number(value)
          return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null
        },
      },
      { key: 'categoryCode', label: '分类编码', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI_CAPABILITY、MEDICAL' },
      { key: 'categoryName', label: '分类名称', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI能力、医疗' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
    ],
  },
  'content-relations': {
    key: 'content-relations',
    title: '内容关联',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无内容关联',
    api: {
      list: '/admin/api/content-relations',
      create: '/admin/api/content-relations',
      update: '/admin/api/content-relations/{id}',
      delete: '/admin/api/content-relations/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: false, field: 'visible', mode: 'update' },
    reorder: { enabled: false, mode: 'ordered-ids' },
    columns: [
      { key: 'relationName', label: '关系' },
      { key: 'sourceType', label: '来源类型' },
      { key: 'sourceId', label: '来源 ID' },
      { key: 'targetType', label: '目标类型' },
      { key: 'targetId', label: '目标 ID' },
      { key: 'relationType', label: '关系编码' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      {
        key: 'relationType',
        label: '关系编码',
        type: 'text',
        required: true,
        maxLength: 64,
        placeholder: 'PRODUCT_CASE / CASE_INDUSTRY / AI_PRODUCT / RESEARCH_PRODUCT',
      },
      {
        key: 'sourceType',
        label: '来源类型',
        type: 'text',
        required: true,
        maxLength: 32,
        placeholder: 'PRODUCT / CASE / AI_CARD / RESEARCH_DIRECTION',
      },
      { key: 'sourceId', label: '来源 ID', type: 'number', required: true, min: 1, placeholder: '填写来源内容 ID' },
      {
        key: 'targetType',
        label: '目标类型',
        type: 'text',
        required: true,
        maxLength: 32,
        placeholder: 'CASE / INDUSTRY_SOLUTION / PRODUCT',
      },
      { key: 'targetId', label: '目标 ID', type: 'number', required: true, min: 1, placeholder: '填写目标内容 ID' },
    ],
  },
  'content-references': {
    key: 'content-references',
    title: '内容引用',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无内容引用',
    api: {
      list: '/admin/api/content-references',
      create: '/admin/api/content-references',
      update: '/admin/api/content-references/{id}',
      delete: '/admin/api/content-references/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: false, field: 'visible', mode: 'update' },
    reorder: { enabled: false, mode: 'ordered-ids' },
    columns: [
      { key: 'referrerType', label: '引用方类型' },
      { key: 'referrerKey', label: '引用方标识' },
      { key: 'referencedType', label: '被引用类型' },
      { key: 'referencedId', label: '被引用 ID' },
      { key: 'referenceType', label: '引用类型' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      {
        key: 'referrerType',
        label: '引用方类型',
        type: 'text',
        required: true,
        maxLength: 32,
        placeholder: 'PAGE / PAGE_SECTION / HOME',
      },
      {
        key: 'referrerKey',
        label: '引用方标识',
        type: 'text',
        required: true,
        maxLength: 128,
        placeholder: '例如：首页 Hero、/cases、home.client-logo',
      },
      {
        key: 'referencedType',
        label: '被引用类型',
        type: 'text',
        required: true,
        maxLength: 32,
        placeholder: 'PRODUCT / CASE / CLIENT_LOGO / MEDIA_ASSET',
      },
      { key: 'referencedId', label: '被引用 ID', type: 'number', required: true, min: 1, placeholder: '填写被引用内容 ID' },
      {
        key: 'referenceType',
        label: '引用类型',
        type: 'text',
        required: true,
        maxLength: 64,
        placeholder: 'PAGE_REFERENCE / SECTION_REFERENCE / LOGO_REFERENCE',
      },
    ],
  },
  'business-registry': {
    key: 'business-registry',
    title: '业务中心',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无业务',
    api: {
      list: '/admin/api/business-registry',
      create: '/admin/api/business-registry',
      update: '/admin/api/business-registry/{id}',
      delete: '/admin/api/business-registry/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: false, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/business-registry/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedBusinessIds',
    },
    columns: [
      { key: 'icon', label: '图标', type: 'media', mediaKey: 'icon' },
      { key: 'businessCode', label: '业务编码' },
      { key: 'businessName', label: '业务名称' },
      { key: 'description', label: '业务描述', type: 'description' },
      { key: 'businessStatus', label: '业务状态' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'businessCode', label: '业务编码', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI_CENTER、MEDICAL、EDUCATION' },
      { key: 'businessName', label: '业务名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：AI 能力中心、医疗方案' },
      {
        key: 'iconMediaId',
        label: '业务图标媒体 ID',
        type: 'media-id',
        min: 1,
        placeholder: '可选，填写已上传图片媒体 ID',
        valueFromRow: (row) => row.iconMediaId,
        previewKey: 'iconUrl',
      },
      { key: 'businessStatus', label: '业务状态', type: 'text', required: true, maxLength: 32, defaultValue: 'DRAFT', placeholder: 'DRAFT / ONLINE / OFFLINE' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'description', label: '业务描述', type: 'textarea', maxLength: 512, placeholder: '填写业务定位、目标用户或页面用途' },
      { key: 'iconUrl', label: '图标预览', type: 'text', submit: false, valueFromRow: (row) => row.iconUrl },
    ],
  },
  'business-templates': {
    key: 'business-templates',
    title: '业务模板',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无业务模板',
    api: {
      list: '/admin/api/business-templates',
      create: '/admin/api/business-templates',
      update: '/admin/api/business-templates/{id}',
      delete: '/admin/api/business-templates/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: false, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/business-templates/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedTemplateIds',
    },
    customActions: [
      { key: 'copy-template', label: '复制模板', variant: 'ghost' },
      { key: 'create-business-from-template', label: '创建业务' },
    ],
    columns: [
      { key: 'defaultIcon', label: '默认图标', type: 'media', mediaKey: 'defaultIcon' },
      { key: 'templateCode', label: '模板编码' },
      { key: 'templateName', label: '模板名称' },
      { key: 'templateType', label: '模板类型' },
      { key: 'defaultBusinessCode', label: '默认业务编码' },
      { key: 'defaultBusinessName', label: '默认业务名称' },
      { key: 'defaultBusinessStatus', label: '默认状态' },
      { key: 'description', label: '模板描述', type: 'description' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'templateCode', label: '模板编码', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI_CENTER_TEMPLATE、MEDICAL_TEMPLATE' },
      { key: 'templateName', label: '模板名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：AI能力中心模板、医疗方案模板' },
      { key: 'templateType', label: '模板类型', type: 'text', required: true, maxLength: 64, placeholder: 'AI_CENTER / MEDICAL / EDUCATION / INDUSTRY / PRODUCT_CENTER' },
      { key: 'defaultBusinessCode', label: '默认业务编码', type: 'text', maxLength: 64, placeholder: '例如：AI_CENTER、MEDICAL' },
      { key: 'defaultBusinessName', label: '默认业务名称', type: 'text', maxLength: 128, placeholder: '从模板创建业务时可默认使用' },
      {
        key: 'defaultIconMediaId',
        label: '默认图标媒体 ID',
        type: 'media-id',
        min: 1,
        placeholder: '可选，填写已上传图片媒体 ID',
        valueFromRow: (row) => row.defaultIconMediaId,
        previewKey: 'defaultIconUrl',
      },
      { key: 'defaultBusinessStatus', label: '默认业务状态', type: 'text', required: true, maxLength: 32, defaultValue: 'DRAFT', placeholder: 'DRAFT / ONLINE / OFFLINE' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'description', label: '模板描述', type: 'textarea', maxLength: 512, placeholder: '说明模板适用业务、页面结构和运营场景' },
      {
        key: 'templateConfig',
        label: '模板配置',
        type: 'textarea',
        maxLength: 4000,
        placeholder: '{"blocks":["Hero","能力介绍","案例","CTA"]}',
      },
      { key: 'defaultIconUrl', label: '默认图标预览', type: 'text', submit: false, valueFromRow: (row) => row.defaultIconUrl },
    ],
  },
  'business-blocks': {
    key: 'business-blocks',
    title: '业务区块库',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无业务区块',
    api: {
      list: '/admin/api/business-blocks',
      create: '/admin/api/business-blocks',
      update: '/admin/api/business-blocks/{id}',
      delete: '/admin/api/business-blocks/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/business-blocks/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedBlockIds',
    },
    columns: [
      { key: 'blockCode', label: '区块编码' },
      { key: 'blockName', label: '区块名称' },
      { key: 'blockType', label: '区块类型' },
      { key: 'description', label: '说明', type: 'description' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'blockCode', label: '区块编码', type: 'text', required: true, maxLength: 64, placeholder: '例如：HERO_MAIN、CASE_LIST、CTA_PRIMARY' },
      { key: 'blockName', label: '区块名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：首页 Hero、案例列表、行动号召' },
      { key: 'blockType', label: '区块类型', type: 'text', required: true, maxLength: 64, placeholder: 'HERO / STATS / PRODUCT_LIST / CASE_LIST / CAPABILITY_CARDS / CONTACT_US / CTA' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'description', label: '说明', type: 'textarea', maxLength: 512, placeholder: '说明该区块适用页面、展示内容和运营用途' },
      {
        key: 'defaultConfig',
        label: '默认配置',
        type: 'textarea',
        maxLength: 4000,
        placeholder: '{"title":"","sourceType":"MANUAL","limit":6}',
      },
    ],
  },
  'business-pages': {
    key: 'business-pages',
    title: '业务页面',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无业务页面',
    api: {
      list: '/admin/api/business-pages',
      create: '/admin/api/business-pages',
      update: '/admin/api/business-pages/{id}',
      delete: '/admin/api/business-pages/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/business-pages/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedPageIds',
    },
    columns: [
      { key: 'pageCode', label: '页面编码' },
      { key: 'pageName', label: '页面名称' },
      { key: 'businessName', label: '所属业务' },
      { key: 'templateName', label: '来源模板' },
      { key: 'routePath', label: '页面路径' },
      { key: 'pageStatus', label: '页面状态' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'businessId', label: '业务 ID', type: 'number', required: true, min: 1, placeholder: '填写业务中心中的业务 ID' },
      {
        key: 'templateId',
        label: '模板 ID',
        type: 'number',
        min: 1,
        placeholder: '可选，填写业务模板 ID',
        submitValue: (value) => {
          const numberValue = Number(value)
          return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null
        },
      },
      { key: 'pageCode', label: '页面编码', type: 'text', required: true, maxLength: 64, placeholder: '例如：AI_CENTER_HOME、MEDICAL_HOME' },
      { key: 'pageName', label: '页面名称', type: 'text', required: true, maxLength: 128, placeholder: '例如：AI 能力中心首页、医疗方案页' },
      { key: 'routePath', label: '页面路径', type: 'text', required: true, maxLength: 256, placeholder: '例如：/business/ai-center' },
      { key: 'pageStatus', label: '页面状态', type: 'text', required: true, maxLength: 32, defaultValue: 'DRAFT', placeholder: 'DRAFT / ONLINE / OFFLINE' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      {
        key: 'pageConfig',
        label: '页面配置',
        type: 'textarea',
        maxLength: 4000,
        placeholder: '{"layout":"standard","seoTitle":"","seoDescription":""}',
      },
    ],
  },
  'business-page-blocks': {
    key: 'business-page-blocks',
    title: '页面区块组合',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无页面区块',
    api: {
      list: '/admin/api/business-page-blocks',
      create: '/admin/api/business-page-blocks',
      update: '/admin/api/business-page-blocks/{id}',
      delete: '/admin/api/business-page-blocks/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/business-page-blocks/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedPageBlockIds',
    },
    columns: [
      { key: 'pageName', label: '所属页面' },
      { key: 'pageId', label: '页面 ID' },
      { key: 'blockCode', label: '区块编码' },
      { key: 'blockName', label: '区块名称' },
      { key: 'blockType', label: '区块类型' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'pageId', label: '页面 ID', type: 'number', required: true, min: 1, placeholder: '填写业务页面 ID' },
      { key: 'blockId', label: '区块 ID', type: 'number', required: true, min: 1, placeholder: '填写业务区块库中的区块 ID' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      {
        key: 'blockConfig',
        label: '区块配置',
        type: 'textarea',
        maxLength: 4000,
        placeholder: '留空时使用区块库默认配置',
      },
    ],
  },
  'industry-solutions': {
    key: 'industry-solutions',
    title: '行业方案',
    idField: 'id',
    versionField: 'version',
    listMode: 'page-records',
    emptyText: '暂无行业方案',
    api: {
      list: '/admin/api/industry-solutions',
      create: '/admin/api/industry-solutions',
      update: '/admin/api/industry-solutions/{id}',
      delete: '/admin/api/industry-solutions/{id}',
    },
    delete: { mode: 'body' },
    visibility: { enabled: true, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/industry-solutions/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedIds',
    },
    columns: [
      { key: 'icon', label: '图标', type: 'media', mediaKey: 'icon' },
      { key: 'name', label: '行业名称' },
      { key: 'description', label: '描述', type: 'description' },
      { key: 'customerTags', label: '客户标签' },
      { key: 'visible', label: '是否显示', type: 'switch' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'name', label: '行业名称', type: 'text', required: true, maxLength: 100, placeholder: '例如：智慧教育' },
      {
        key: 'iconMediaId',
        label: '图标媒体 ID',
        type: 'media-id',
        required: true,
        min: 1,
        placeholder: '请输入已上传图片媒体 ID',
        valueFromRow: (row) => row.iconMediaId,
        previewKey: 'iconUrl',
      },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
      { key: 'visible', label: '是否显示', type: 'switch', defaultValue: true },
      { key: 'description', label: '描述', type: 'textarea', required: true, maxLength: 500, placeholder: '填写行业方案描述' },
      {
        key: 'customerTags',
        label: '客户标签',
        type: 'textarea',
        placeholder: '每行一个标签，最多 10 个',
        valueFromRow: (row) => (Array.isArray(row.customerTags) ? row.customerTags.join('\n') : ''),
        submitValue: splitTags,
      },
      { key: 'iconUrl', label: '图标预览', type: 'text', submit: false, valueFromRow: (row) => row.iconUrl },
    ],
  },
  'cooperation-direction-tags': {
    key: 'cooperation-direction-tags',
    title: '合作方向标签',
    idField: 'id',
    versionField: 'version',
    listMode: 'array',
    emptyText: '暂无合作方向标签',
    api: {
      list: '/admin/api/cooperation-direction-tags',
      create: '/admin/api/cooperation-direction-tags',
      update: '/admin/api/cooperation-direction-tags/{id}',
      delete: '/admin/api/cooperation-direction-tags/{id}',
    },
    delete: { mode: 'query' },
    visibility: { enabled: false, field: 'visible', mode: 'update' },
    reorder: {
      enabled: true,
      path: '/admin/api/cooperation-direction-tags/reorder',
      method: 'post',
      mode: 'ordered-ids',
      orderedIdsField: 'orderedCooperationDirectionTagIds',
    },
    columns: [
      { key: 'tagText', label: '标签文本' },
      { key: 'sortOrder', label: '排序', type: 'sort' },
      { key: 'updatedAt', label: '更新时间', type: 'date' },
    ],
    fields: [
      { key: 'tagText', label: '标签文本', type: 'text', required: true, maxLength: 32, placeholder: '例如：技术合作' },
      { key: 'sortOrder', label: '排序', type: 'number', disabled: true, submit: false, placeholder: '由上移/下移调整' },
    ],
  },
}

export function getSiteModuleFormConfig(key: string) {
  return siteModuleFormConfigs[key]
}
