import * as url from 'node:url'
import { type Context, type Next } from 'koa'
export default class IdpMiddlewares {
  async idpUrlFormatter (ctx: Context, next: Next) {
    if (ctx.secure) {
      return await next()
    } else if (ctx.req.method === 'GET' || ctx.req.method === 'HEAD') {
      ctx.redirect(url.format({
        protocol: 'https',
        host: ctx.get('host'),
        pathname: ctx.req.url
      }))
    } else {
      ctx.status = (400)
      ctx.body = ({
        error: 'invalid_request',
        error_description: 'do yourself a favor and only use https'
      })
    }
  }
}
