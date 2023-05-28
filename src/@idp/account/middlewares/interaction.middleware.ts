import type Provider from 'oidc-provider'
import { type Context, type Next } from 'koa'
export class InteractionIdpMiddleware {
  constructor (private readonly provider: Provider) {
  }

  async setNoCache (ctx: Context, next: Next) {
    ctx.set('cache-control', 'no-store')
    return await next()
  }

  async updateInteractionView (ctx: Context, next: Next) {
    // const orig = res.render
    // ctx.render = (view, locals) => {
    //   this.app.render(view, locals, (err, html) => {
    //     if (err !== undefined) { throw err }
    //     orig.call(res, '_layout', {
    //       ...locals,
    //       body: html
    //     } as any)
    //   })
    // }
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
