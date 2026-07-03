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

export type SiteModuleFormConfig = {
  key: string
  title: string
  idField: string
  versionField: string
  listMode: 'array' | 'page-records' | 'singleton' | 'tree-items'
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
