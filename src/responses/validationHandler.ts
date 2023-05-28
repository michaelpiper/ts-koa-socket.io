import { type Context, type Middleware, type Next } from 'koa'
import { ErrorCode, ErrorDescription } from '../common/constants.js'
import joi from 'joi'
import lodash from 'lodash'
import { UnprocessableEntity } from './clientErrors/unprocessableEntity.clientError.js'
declare module 'koa' {
  interface Request {
    result?: unknown
  }
}
export type ValidationDataSource = 'request.body' | 'request.query' | 'cookies' | 'state' | 'params'
export default (validation: joi.Schema, options?: joi.AsyncValidationOptions & { sources?: ValidationDataSource[] }): Middleware => {
  const { sources = [], ...opts } = options ?? {}
  const dataSources = sources ?? []
  return async (ctx: Context, next: Next) => {
    try {
      const sourceData: any = {}
      for (const source of dataSources) {
        const data = lodash.get(ctx.request, source as string)
        lodash.merge(sourceData, data)
      }
      ctx.request.result = await validation.validateAsync(sourceData, opts)
    } catch (error) {
      if (error instanceof joi.ValidationError) {
        return await reportCustomError(error)
      }
      throw error
    }
    return await next()
  }
}
const reportCustomError = async (error: joi.ValidationError): Promise<any> => {
  throw new UnprocessableEntity(
    ErrorCode.INVALID_INPUT,
    ErrorDescription.INVALID_INPUT,
    error.details
  ).withRootError(error)
}
