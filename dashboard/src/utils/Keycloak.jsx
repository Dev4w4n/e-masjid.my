// keycloak.js

import Keycloak from 'keycloak-js'
import { config } from '@/config'

const keycloak = new Keycloak({
  url: config.url.KEYCLOAK_BASE_URL,
  realm: config.url.KEYCLOAK_REALM ? config.url.KEYCLOAK_REALM : 'dev',
  clientId: config.url.KEYCLOAK_CLIENT_ID,
})

export { keycloak }
