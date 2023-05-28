import zeroant from './zeroant.js'
import Config from '../common/config/index.js'
import { Plugin } from '../common/plugins/index.js'
import Registry from '../common/registry.js'
export default async () => {
  const plugins = new Plugin(zeroant)
  const config = new Config(process.env)
  for (const addon of Registry.configs) {
    config.addons
      .set(addon)
  }
  await zeroant.initConfig(config)

  const registry = new Registry(zeroant)
  for (const plugin of registry.plugins ?? []) {
    plugins.add(plugin)
  }

  await zeroant.initPlugin(plugins)
  zeroant.initMiddleware(registry.middleware ?? [])
  zeroant.initRoutes(registry.routes ?? [])
  for (const AddonServer of registry.servers ?? []) {
    zeroant.initServer(AddonServer)
  }
  process.on('exit', () => {
    zeroant.close()
  }).on('SIGINT', () => {
    zeroant.close()
  })
  return zeroant
}
