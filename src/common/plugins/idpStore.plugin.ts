import { Redis } from 'ioredis'
import { AddonPlugin } from '../../factories/addon.plugin.js'
export default class IdpStorePlugin extends AddonPlugin {
  private _redis: Redis
  private _redisPort: number
  private _redisHost: string
  async initialize () {
    this._redisPort = this.context.config.redisPort
    this._redisHost = this.context.config.redisHost
    if (this._redis instanceof Redis) {
      console.info(new Date(), '[Redis]: Already Started')
    }
    if (this._redis === undefined) {
      this._redis = new Redis(this._redisPort, this._redisHost, { keyPrefix: `${this.context.config.appName}:${this.context.config.environment}:oidc:` })
      console.log('Running Idp Store with Redis on port %s', this._redisPort)
    }
  }

  close () {
    void this._redis.quit()
    console.info(new Date(), '[RedisPlugin]: Stopped')
  }

  get instance (): Redis {
    return this._redis
  }
}
