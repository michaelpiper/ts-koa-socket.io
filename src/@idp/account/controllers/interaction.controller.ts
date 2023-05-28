/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import type Provider from 'oidc-provider'
import { debugIdpProvider as debug } from '../../support/debug.js'
import { strict as assert } from 'node:assert'
import Account from '../../support/account.js'
import { type Context, type Next } from 'koa'
import crypto from 'crypto'
export class InteractionIdpController {
  constructor (private readonly provider: Provider) {
  }

  async callbackGoogle (ctx: Context) {
    const nonce = (ctx.res as any).locals.cspNonce
    await ctx.render('repost', { layout: false, upstream: 'google', nonce })
  }

  async retrieve (ctx: Context, next: Next): Promise<void> {
    const {
      uid, prompt, params, session
    } = await this.provider.interactionDetails(ctx.req, ctx.res)
    console.log('prompt name', prompt.name, params.details)
    const client = await this.provider.Client.find(params.client_id as string)
    console.log('client', client)
    switch (prompt.name) {
      case 'login': {
        return await ctx.render('login', {
          layout: '_layout',
          client,
          uid,
          details: prompt.details,
          params,
          title: 'Sign-in',
          google: ctx.google,
          session: (session != null) ? debug(session) : undefined,
          dbg: {
            params: debug(params),
            prompt: debug(prompt)
          }
        })
      }
      case 'consent': {
        return await ctx.render('interaction', {
          layout: '_layout',
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
      }
      default:
        return await next()
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

    await this.provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false
    })
  }

  async accountConfirm (ctx: Context, next: Next) {
    const provider = this.provider
    const interactionDetails = await provider.interactionDetails(ctx.req, ctx.res)
    const { prompt: { name, details }, params, session = {} } = interactionDetails
    const { accountId } = session as any ?? {} as any
    assert.equal(name, 'consent')

    let { grantId } = interactionDetails
    let grant!: any

    if (typeof grantId === 'string') {
      // we'll be modifying existing grant in existing session
      grant = await provider.Grant.find(grantId)
    } else {
      // we're establishing a new grant
      grant = new provider.Grant({
        accountId,
        clientId: params.client_id as string
      })
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (details.missingOIDCScope) {
      grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '))
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (details.missingOIDCClaims) {
      grant.addOIDCClaims(details.missingOIDCClaims)
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (details.missingResourceScopes) {
      for (const [indicator, scope] of Object.entries(details.missingResourceScopes)) {
        grant.addResourceScope(indicator, scope.join(' '))
      }
    }

    grantId = await grant.save()

    const consent: Record<string, any> = {}
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!interactionDetails.grantId) {
      // we don't have to pass grantId to consent, we're just modifying existing one
      consent.grantId = grantId
    }

    const result = { consent }
    await provider.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: true
    })
  }

  async accountAbort (ctx: Context, next: Next) {
    const result = {
      error: 'access_denied',
      error_description: 'End-User aborted interaction'
    }
    await this.provider.interactionFinished(ctx.req, ctx.res, result, { mergeWithLastSubmission: false })
  }

  async accountFederated (ctx: Context, next: Next) {
    const provider = this.provider
    const body = ctx.request.body as Record<string, any>
    const { prompt: { name } } = await provider.interactionDetails(ctx.req, ctx.res)
    assert.equal(name, 'login')

    const path = `/idp/interaction/${ctx.params.uid as string}/federated`

    switch (body.upstream) {
      case 'google': {
        const callbackParams = ctx.google.callbackParams(ctx.req)

        // init
        if (Object.keys(callbackParams).length === 0) {
          const state = `${ctx.params.uid as string}|${crypto.randomBytes(32).toString('hex')}`
          const nonce = crypto.randomBytes(32).toString('hex')

          ctx.cookies.set('google.state', state, { path, sameSite: 'strict' })
          ctx.cookies.set('google.nonce', nonce, { path, sameSite: 'strict' })

          ctx.status = 303
          ctx.redirect(ctx.google.authorizationUrl({
            state, nonce, scope: 'openid email profile'
          })); return
        }

        // callback
        const state = ctx.cookies.get('google.state')
        ctx.cookies.set('google.state', null, { path })
        const nonce = ctx.cookies.get('google.nonce')
        ctx.cookies.set('google.nonce', null, { path })

        const tokenset = await ctx.google.callback(undefined, callbackParams, { state, nonce, response_type: 'id_token' })
        const account = await Account.findByFederated('google', tokenset.claims())

        const result = {
          login: {
            accountId: account.accountId
          }
        }
        await provider.interactionFinished(ctx.req, ctx.res, result, {
          mergeWithLastSubmission: false
        }); return
      }
      default:
        return undefined
    }
  }
}
