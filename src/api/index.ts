import * as auth from '../admin/api/adminAuth'
import * as product from '../admin/api/adminProduct'
import * as caseApi from '../admin/api/adminCase'
import * as lead from '../admin/api/adminLead'
import * as media from '../admin/api/adminMedia'
import * as site from '../admin/api/adminSite'
import * as portal from './portal'

export const api = {
  auth,
  product,
  case: caseApi,
  lead,
  media,
  site,
  ai: {
    getPortalAiCards: portal.getPortalAiCards,
  },
  portal,
}

export default api
