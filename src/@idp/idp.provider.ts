import Provider from 'oidc-provider'
import { RedisIdpAdapter } from './adapters/redis.adapter.js'
import configuration from './support/configuration.js'
const ISSUER = 'http://localhost'
const idpProvider = new Provider(ISSUER, { adapter: RedisIdpAdapter, ...configuration })
export default idpProvider
