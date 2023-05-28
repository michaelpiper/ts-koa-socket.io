import { type InteractionResults, type PromptDetail, type UnknownObject } from 'oidc-provider'
export interface Interaction {
  readonly kind: 'Interaction'
  iat: number
  exp: number
  session?: {
    accountId: string
    uid: string
    cookie: string
    acr?: string | undefined
    amr?: string[] | undefined
  } | undefined
  params: UnknownObject
  prompt: PromptDetail
  result?: InteractionResults | undefined
  returnTo: string
  deviceCode?: string | undefined
  trusted?: string[] | undefined
  uid: string
  lastSubmission?: InteractionResults | undefined
  grantId?: string | undefined
  cid: string
  save: (ttl: number) => Promise<string>
  persist: () => Promise<string>
}
