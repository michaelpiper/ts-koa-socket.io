import zeroant from '../../loaders/zeroant.js'
import isEmpty from 'lodash/isEmpty.js'
import IdpStorePlugin from '../../common/plugins/idpStore.plugin.js'
import { type Redis } from 'ioredis'
import IdpAdapterFactory from '../../factories/idpAdapter.factory.js'
const grantable = new Set([
  'AccessToken',
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest'
])
const consumable = new Set([
  'AuthorizationCode',
  'RefreshToken',
  'DeviceCode',
  'BackchannelAuthenticationRequest'
])
function grantKeyFor (id: string) {
  return `grant:${id}`
}
function userCodeKeyFor (userCode: string) {
  return `userCode:${userCode}`
}
function uidKeyFor (uid: string) {
  return `uid:${uid}`
}
export class RedisIdpAdapter extends IdpAdapterFactory {
  client: Redis
  constructor (public name: string) {
    super(name)
    this.name = name
    const redis = zeroant.plugin.get(IdpStorePlugin).instance
    this.client = redis
  }

  async upsert (id: string, payload: Record<string, any>, expiresIn: number = 0) {
    const key = this.key(id)
    const multi = this.client.multi()
    if (consumable.has(this.name)) {
      const store = { payload: JSON.stringify(payload) }
      multi.hmset(key, store)
    } else {
      const store = JSON.stringify(payload)
      multi.set(key, store)
    }
    if (expiresIn !== undefined) {
      multi.expire(key, expiresIn)
    }
    if (grantable.has(this.name) && payload.grantId !== null && payload.grantId !== undefined && payload.grantId !== '') {
      const grantKey = grantKeyFor(payload.grantId)
      multi.rpush(grantKey, key)
      const ttl = await this.client.ttl(grantKey)
      if (expiresIn !== undefined && expiresIn > ttl) {
        multi.expire(grantKey, expiresIn)
      }
    }
    if (payload.userCode !== null && payload.userCode !== undefined && payload.userCode !== '') {
      const userCodeKey = userCodeKeyFor(payload.userCode)
      multi.set(userCodeKey, id)
      multi.expire(userCodeKey, expiresIn)
    }
    if (payload.uid !== null && payload.uid !== undefined && payload.uid !== '') {
      const uidKey = uidKeyFor(payload.uid)
      multi.set(uidKey, id)
      multi.expire(uidKey, expiresIn)
    }
    await multi.exec()
  }

  async find (id: string) {
    const data = consumable.has(this.name)
      ? await this.client.hgetall(this.key(id))
      : await this.client.get(this.key(id))
    if (isEmpty(data)) {
      return undefined
    }
    if (typeof data === 'string') {
      return JSON.parse(data)
    }
    const { payload, ...rest } = data as any
    return {
      ...rest,
      ...JSON.parse(payload)
    }
  }

  async findByUid (uid: string) {
    const id = await this.client.get(uidKeyFor(uid))
    return await this.find(id as string)
  }

  async findByUserCode (userCode: string) {
    const id = await this.client.get(userCodeKeyFor(userCode))
    return await this.find(id as string)
  }

  async destroy (id: string) {
    const key = this.key(id)
    await this.client.del(key)
  }

  async revokeByGrantId (grantId: string) {
    const multi = this.client.multi()
    const tokens = await this.client.lrange(grantKeyFor(grantId), 0, -1)
    tokens.forEach((token) => multi.del(token))
    multi.del(grantKeyFor(grantId))
    await multi.exec()
  }

  async consume (id: string) {
    await this.client.hset(this.key(id), 'consumed', Math.floor(Date.now() / 1000))
  }

  key (id: string) {
    return `${this.name}:${id}`
  }
}
