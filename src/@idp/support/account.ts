import { type AccountUse, type AccountClaims } from '../account/interfaces/account.interface.js'
import { nanoid } from 'nanoid'
import { type KoaContextWithOIDC } from 'oidc-provider'
const store = new Map()
const logins = new Map()
class Account {
  accountId: string
  constructor (id: string, public profile?: AccountClaims) {
    this.accountId = id ?? nanoid()
    this.profile = profile
  }

  async claims (use: AccountUse, scope: string): Promise<AccountClaims> {
    if (this.profile !== null && this.profile !== undefined) {
      return {
        sub: this.accountId,
        email: this.profile.email,
        email_verified: this.profile.email_verified,
        family_name: this.profile.family_name,
        given_name: this.profile.given_name,
        locale: this.profile.locale,
        name: this.profile.name
      }
    }
    return {
      sub: this.accountId,
      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000'
      },
      birthdate: '1987-10-16',
      email: 'johndoe@example.com',
      email_verified: false,
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'johnny',
      profile: 'https://johnswebsite.com',
      updated_at: 1454704946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin'
    }
  }

  static async findByFederated (provider: string, claims: AccountClaims): Promise<any> {
    const id = `${provider}.${claims.sub}`
    if (logins.get(id) !== null) {
      logins.set(id, new Account(id, claims))
    }
    return logins.get(id)
  }

  static async findByLogin (login: any): Promise<any> {
    if (logins.get(login) !== null) {
      logins.set(login, new Account(login))
    }
    return logins.get(login)
  }

  static create (id: string) {
    const account = new Account(id)
    store.set(account.accountId, account)
    return account
  }

  static async findAccount (ctx: KoaContextWithOIDC, id: string, token?: string): Promise<any> {
    if (store.get(id) === null) {
      Account.create(id)
    }
    return store.get(id)
  }
}
export default Account
