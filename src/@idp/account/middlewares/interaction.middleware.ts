import type Provider from 'oidc-provider'
import { type Context, type Next } from 'koa'
import { errors } from 'oidc-provider'
import { defaults } from 'oidc-provider/lib/helpers/defaults.js'
const { SessionNotFound } = errors
export class InteractionIdpMiddleware {
  constructor (private readonly provider: Provider) {
  }

  async setNoCache (ctx: Context, next: Next) {
    ctx.set('cache-control', 'no-store')
    try {
      return await next()
    } catch (err) {
      if (err instanceof SessionNotFound) {
        ctx.status = err.status
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { message: error, error_description } = err
        await defaults.renderError(ctx, { error, error_description }, err)
      } else {
        throw err
      }
    }
  }

  async sessionError (ctx: Context, next: Next) {
    try {
      return await next()
    } catch (error) {
      console.error((error as any)?.message as string)
      throw error
    }
  }
}
