export interface AccountClaimAddress {
  country: string
  formatted: string
  locality: string
  postal_code: string
  region: string
  street_address: string
}
export type AccountUse = 'id_token' | 'userinfo'
export type AccountLocale = 'en-US' | 'en-UK' | 'fr' | string
export interface AccountClaims {
  sub: string
  address?: AccountClaimAddress
  birthdate?: string
  email?: string
  email_verified?: boolean
  family_name?: string
  gender?: string
  given_name?: string
  locale?: AccountLocale
  middle_name?: string
  name?: string
  nickname?: string
  phone_number?: string
  phone_number_verified?: boolean
  picture?: string
  preferred_username?: string
  profile?: string
  updated_at?: number
  website?: string
  zoneinfo?: string
}
