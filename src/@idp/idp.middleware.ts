// import * as url from 'node:url'
import { type Context, type Next } from 'koa'
import { promisify } from 'node:util'
import helmet from 'helmet'
const directives = helmet.contentSecurityPolicy.getDefaultDirectives()
delete directives['form-action']

export class IdpMiddleware {
  pHelmet = promisify(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives
    }
  }))

  async updateViewLayout (ctx: Context, next: Next) {
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

  async idpUrlFormatter (ctx: Context, next: Next) {
    const req = ctx.req as any
    const origSecure = req.secure
    req.secure = ctx.request.secure
    await this.pHelmet(ctx.req, ctx.res)
    req.secure = origSecure
    return await next()
    // if (ctx.secure) {
    //   return await next()
    // } else if (ctx.req.method === 'GET' || ctx.req.method === 'HEAD') {
    //   ctx.redirect(url.format({
    //     protocol: 'https',
    //     host: ctx.get('host'),
    //     pathname: ctx.req.url
    //   }))
    // } else {
    //   ctx.status = (400)
    //   ctx.body = ({
    //     error: 'invalid_request',
    //     error_description: 'do yourself a favor and only use https'
    //   })
    // }
  }
}
