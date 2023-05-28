import { AddonPlugin } from '../../factories/addon.plugin.js'
import { RedisPlugin } from './redis.plugin.js'
import cacheManager, { type MemoryCache, type MultiCache, type Milliseconds, type Cache, type Store } from 'cache-manager'
import * as redisStore from 'cache-manager-redis'
export type AsyncOrCacheStrategy<T> = (key: string, ttl: number) => Promise<T | null>
export type CacheOrAsyncStrategy<T> = (key: string, ttl: number) => Promise<T>
export type JustAsyncStrategy<T> = (key: string, ttl: number) => Promise<T>
export type JustCacheStrategy<T> = (key: string) => Promise<T | null>

export type StrategySource<T> = () => T | Promise<T>
export interface CacheStrategy<T> {
  asyncOrCache: AsyncOrCacheStrategy<T>
  cacheOrAsync: CacheOrAsyncStrategy<T>
  justCache: JustCacheStrategy<T>
  justAsync: JustAsyncStrategy<T>
}
export class CacheError extends Error {
}
export class CacheData<T> {
  static defaultTtl = 1000
  constructor (public data: T, public expiry: Milliseconds) {
  }

  static createExpiry (ttl?: Milliseconds): Milliseconds {
    return new Date().getTime() + (ttl ?? CacheData.defaultTtl)
  }

  get expired () {
    return new Date().getTime() > this.expiry
  }
}
export class CacheManagerPlugin extends AddonPlugin {
  redisCache: Cache<Store>
  memoryCache: MemoryCache
  multiCache: MultiCache
  async initialize () {
    const redis = this.context.plugin.get(RedisPlugin)
    this.redisCache = await cacheManager.caching(redisStore.create, {
      ...redis.options,
      db: 0,
      ttl: 600
    })
    this.memoryCache = await cacheManager.caching('memory', { max: 100, ttl: 60 })
    this.multiCache = cacheManager.multiCaching([this.memoryCache, this.redisCache])
  }

  async find (key: string) {
    const jsonString: string | undefined = await this.multiCache.get(key)
    if (jsonString === null || jsonString === undefined) {
      return null
    }
    const json = JSON.parse(jsonString)
    const data = new CacheData(json.data, json.expiry)
    return data
  }

  async get (key: string) {
    const data = await this.find(key)
    if (data === null || data.expired) {
      return null
    }
    return data.data
  }

  async set (key: string, value: any, ttl: Milliseconds) {
    const expiry = CacheData.createExpiry(ttl)
    const jsonString = JSON.stringify(new CacheData(value, expiry))
    await this.multiCache.set(key, jsonString, ttl)
  }

  async has (key: string) {
    const jsonString = await this.multiCache.get(key)
    if (jsonString === null || jsonString === undefined) {
      return false
    }
    return true
  }

  async del (key: string) {
    await this.multiCache.del(key)
  }

  withStrategy <T>(source: StrategySource<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const parent = this
    return {
      async asyncOrCache (key: string, ttl: Milliseconds) {
        try {
          const data = await source()
          await parent.set(key, data, ttl)
          return data
        } catch (_) {
        }
        if (await parent.has(key)) {
          return await parent.get(key)
        }
        return null
      },
      async cacheOrAsync (key: string, ttl: Milliseconds) {
        if (await parent.has(key)) {
          return await parent.get(key)
        }
        const data = await source()
        await parent.set(key, data, ttl)
        return data
      },
      async justCache (key: string) {
        if (await parent.has(key)) {
          return await parent.get(key)
        }
        return null
      },
      async justAsync (key: string, ttl: Milliseconds) {
        try {
          const data = await source()
          await parent.set(key, data, ttl)
          return data
        } catch (error) {
          if (error instanceof Error) {
            throw new CacheError(`Error occured while catching data: ${error.message}`)
          }
          throw new CacheError('Unknown Error occured while catching data')
        }
      }
    }
  }
}
