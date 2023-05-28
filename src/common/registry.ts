import RegistryFactory from '../factories/registry.factory.js'
import ApiEntry from '../@api/api.entry.js'
import IdpEntry from '../@idp/idp.entry.js'
import morgan from 'koa-morgan'
import { RedisPlugin } from './plugins/redis.plugin.js'
import { AdminAddonConfig } from './addons/admin.addon.config.js'
import { DBAddonConfig } from './addons/db.addon.config.js'
import { DBPlugin } from './plugins/db.plugin.js'
import { CacheManagerPlugin } from './plugins/cacheManger.plugin.js'
import AdminServer from './servers/admin.server.js'
import { SocketServer } from './servers/socket.server.js'
import IdpStorePlugin from './plugins/idpStore.plugin.js'
import { type ZeroantContext } from 'loaders/zeroant.context.js'
import bodyParser from 'koa-bodyparser'
export class Registry extends RegistryFactory {
  context
  config
  constructor (context: ZeroantContext) {
    super()
    this.context = context
    this.config = context.config
  }

  static configs = [
    AdminAddonConfig,
    DBAddonConfig
  ]

  plugins = [
    RedisPlugin,
    DBPlugin,
    IdpStorePlugin,
    CacheManagerPlugin
  ]

  middleware = [
    morgan('common'),
    bodyParser()
  ]

  servers = [
    AdminServer,
    SocketServer
  ]

  get routes () {
    return [
      new ApiEntry(this.context),
      new IdpEntry(this.context)
    ]
  }
}
export default Registry
// # sourceMappingURL=registry.js.map
