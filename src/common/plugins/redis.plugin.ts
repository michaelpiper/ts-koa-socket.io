import * as redis from 'redis'
import { AddonPlugin } from '../../factories/addon.plugin.js'
import { Redis } from 'ioredis'
export class RedisPlugin extends AddonPlugin {
  private _redis: redis.RedisClient
  private _redisPort: number
  private _redisHost: string
  async initialize (): Promise<void> {
    this._redisPort = this.context.config.redisPort
    this._redisHost = this.context.config.redisHost
    if (this._redis instanceof redis.RedisClient) {
      console.info(new Date(), '[Redis]: Already Started')
    }
    if (this._redis === undefined) {
      const redisOptions = {
        host: this._redisHost,
        port: this._redisPort
      }
      this._redis = redis.createClient(redisOptions)
      console.log('Running Redis Server on port %s', this._redisPort)
    }
  }

  async getValueWithKey (key: string): Promise<string | null> {
    return await new Promise((resolve, reject) => {
      this._redis.get(key, (err, value) => {
        if (err != null) {
          reject(err)
          return
        }
        if (typeof value === 'string') {
          resolve(value.toString())
          return
        }
        resolve(null)
      })
    })
  }

  close () {
    this._redis.quit()
    console.info(new Date(), '[RedisPlugin]: Stopped')
  }

  clone (): redis.RedisClient {
    return redis.createClient(this.options)
  }

  ioclone (): Redis {
    return new Redis(this.options)
  }

  get instance (): redis.RedisClient {
    return this._redis
  }

  get options () {
    return {
      port: this._redisPort,
      host: this._redisHost
    }
  }
}
