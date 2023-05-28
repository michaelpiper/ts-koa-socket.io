import dotenv from 'dotenv'
import { join, resolve } from 'path'
import { InternalServerError } from '../../responses/serverErrors/InternalServerError.serverError.js'
import { ErrorCode, ErrorDescription } from '../constants.js'
import { type AddonConfigConstructor, type AddonConfig } from '../../factories/addon.config.js'
const ABS_PATH = resolve('.')
const ENV_FILE_PATH = resolve(join(ABS_PATH, '.env'))
const isEnvFound = dotenv.config({ path: ENV_FILE_PATH })
if (isEnvFound.error != null) {
  throw new Error('Cannot find .env file.')
}
export class Config {
  serverPort: number
  redisPort: number
  redisHost: string
  environment: string
  appName: string
  samplePlatformAudience: string | null
  samplePlatformPublicKey: string
  isProd: boolean
  readonly productionEnvironments = ['prod', 'production']
  addons = new ConfigAddons(this)
  absPath = ABS_PATH
  constructor (protected readonly _config: Record<string, string | undefined>) {
    this.environment = this.get('NODE_ENV', 'development')
    this.isProd = this.productionEnvironments.includes(this.environment)
    this.serverPort = parseInt(this.get('SERVER_PORT', '8080'), 10)
    this.appName = this.get('APP_NAME', 'ZeroAnt')
    this.redisPort = parseInt(this.get('REDIS_PORT', ''), 10)
    this.redisHost = this.get('REDIS_HOST', '127.0.0.1')
    this.samplePlatformAudience = this.get('SAMPLE_PLATFORM_AUDIENCE', null)
    this.samplePlatformPublicKey = this.get('SAMPLE_PLATFORM_PUBLIC_KEY', '123123')
  }

  get<T = any>(key: string, defaultValue?: T): T {
    const value = this._config[key]
    if (value === null || value === undefined) {
      if (defaultValue === undefined) {
        throw new InternalServerError(ErrorCode.CONFIG_EXCEPTION, ErrorDescription.CONFIG_EXCEPTION, `Please provide a value for ${key} or a default fallback value in your config source`)
      }
      return defaultValue
    }
    return value as T
  }
}
class ConfigAddons {
  _addons = new Set()
  constructor (protected config: Config) {
  }

  get<T extends AddonConfig>(Type: AddonConfigConstructor<T>): T {
    for (const addon of this._addons.values()) {
      if (addon instanceof Type) {
        return addon
      }
    }
    throw new InternalServerError(ErrorCode.UNIMPLEMENTED_EXCEPTION, ErrorDescription.UNIMPLEMENTED_EXCEPTION, `${Type.name} you trying to get is not implemented`)
  }

  set (Addon: AddonConfigConstructor<AddonConfig>): this {
    this._addons.add(new Addon(this.config))
    return this
  }
}
