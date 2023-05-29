import { ErrorFactory } from '../factories/error.factory.js'
import { type Middleware, type Context, type Next } from 'koa'
import { InternalServerError } from './serverErrors/internalServerError.serverError.js'
import { ErrorCode, ErrorDescription } from '../common/constants.js'
export default (): Middleware => {
  return async (ctx, next: Next) => {
    try {
      return await next()
    } catch (error) {
      if (error instanceof ErrorFactory) {
        return await reportCustomError(error, ctx)
      }
      return await reportCustomError(
        new InternalServerError(
          ErrorCode.UNHANDLED_EXCEPTION,
          ErrorDescription.UNHANDLED_EXCEPTION,
          ''
        ).withRootError(error as any),
        ctx
      )
    }
  }
}
const reportCustomError = async (err: ErrorFactory, ctx: Context): Promise<any> => {
  const { statusCode = 500 } = err
  ctx.status = statusCode
  ctx.body = err
}
