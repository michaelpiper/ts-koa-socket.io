import { type Middleware, type Context, type Next } from 'koa'
import { ArtifactFactory } from '../factories/artifact.factory.js'
export default (): Middleware => {
  return async (ctx: Context, next: Next) => {
    const result = await next()
    if (result instanceof ArtifactFactory) {
      ctx.set('Content-Type', result.contentType)
      ctx.status = result.status
      ctx.body = result.data
    } else if (result !== null && result !== undefined) {
      ctx.body = result
    }
  }
}
