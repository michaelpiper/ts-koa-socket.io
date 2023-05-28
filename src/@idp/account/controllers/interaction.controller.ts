import type Provider from 'oidc-provider'
import { debugIdpProvider as debug } from '../../support/debug.js'
import { strict as assert } from 'node:assert'
import Account from '../../support/account.js'
import { type Context, type Next } from 'koa'
export class InteractionIdpController {
  constructor (private readonly provider: Provider) {
  }

  async retrieve (ctx: Context, next: Next) {
    const {
      uid, prompt, params, session
    } = await this.provider.interactionDetails(ctx.req, ctx.res)
    console.log('prompt name', prompt.name, params.details)
    const client = await this.provider.Client.find(params.client_id as string)
    console.log('client', client)
    switch (prompt.name) {
      case 'login': {
        void ctx.render('login', {
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Sign-in',
          session: (session != null) ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt)
          }
        })
        return
      }
      case 'consent': {
        void ctx.render('interaction', {
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Authorize',
          session: (session != null) ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt)
          }
        })
        return
      }
      default:
        return undefined
    }
  }

  async accountLogin (ctx: Context, next: Next) {
    const body = ctx.request.body as Record<string, any>
    const { prompt: { name } } = await this.provider.interactionDetails(ctx.req, ctx.res)
    assert.equal(name, 'login')
    const account = await Account.findByLogin(body.login)
    const result = {
      login: {
        accountId: account.accountId
      }
    }
    await this.provider.interactionFinished(ctx.req, ctx.res, result, { mergeWithLastSubmission: false })

    await next()
  }

  async accountConfirm (ctx: Context, next: Next) {
    const interactionDetails = await this.provider.interactionDetails(ctx.req, ctx.res)
    const { prompt: { name, details }, params, session } = interactionDetails
    const { accountId } = session ?? {}
    assert.equal(name, 'consent')

    let { grantId } = interactionDetails
    let grant

    if (grantId !== null && grantId !== undefined && grantId !== '') {
      // we'll be modifying existing grant in existing session
      grant = await this.provider.Grant.find(grantId)
    } else {
      // we're establishing a new grant
      grant = new this.provider.Grant({
        accountId,
        clientId: params.client_id as string
      })
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (details.missingOIDCScope !== null || details.missingOIDCScope !== undefined) {
      grant?.addOIDCScope((details.missingOIDCScope as string[]).join(' '))
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (details.missingOIDCClaims !== null || details.missingOIDCClaims !== undefined) {
      grant?.addOIDCClaims(details.missingOIDCClaims as string[])
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (details.missingResourceScopes) {
      for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
        grant?.addResourceScope(indicator, scopes.join(' '))
      }
    }

    grantId = await grant?.save()

    const consent: Record<string, string | undefined> = {}
    if (interactionDetails.grantId === null || interactionDetails.grantId === undefined) {
      // we don't have to pass grantId to consent, we're just modifying existing one
      consent.grantId = grantId
    }

    const result = { consent }
    await this.provider.interactionFinished(ctx.req, ctx.res, result, { mergeWithLastSubmission: true })

    await next()
  }

  async accountAbort (ctx: Context, next: Next) {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction'
    }
    await this.provider.interactionFinished(ctx.req, ctx.res, result, { mergeWithLastSubmission: false })
  }
}
