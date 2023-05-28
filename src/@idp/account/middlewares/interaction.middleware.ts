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

  async updateInteractionView (ctx: Context, next: Next) {
    const orig = ctx.render
    // ctx.render = (view, locals) => {
    //   this.app.render(view, locals, (err, html) => {
    //     if (err !== undefined) { throw err }
    //     orig.call(res, '_layout', {
    //       ...locals,
    //       body: html
    //     } as any)
    //   })
    // }
    ctx.render = async (view, locals) => {
      console.log(String(orig))
      const body = await (orig.call(ctx, view, locals) as any) as string
      const html = await (orig.call(ctx, '_layout', {
        ...locals,
        body
      }) as unknown) as string
      ctx.body = html
    }
    return await next()
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
