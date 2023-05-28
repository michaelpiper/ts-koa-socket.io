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
export type ValidationDataSource = 'body' | 'query' | 'cookies' | 'state' | 'params'
export default (validation: joi.Schema, options?: joi.AsyncValidationOptions & { sources?: ValidationDataSource[] }): Middleware => {
  const { sources = [], ...opts } = options ?? {}
  const dataSources = sources ?? []
  return async (ctx: Context, next: Next) => {
    try {
      const sourceData: any = {}
      for (const source of dataSources) {
        const data = getDataSource(ctx, source)
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
const getDataSource = (ctx: Context, source: ValidationDataSource): Record<string, unknown> => {
  switch (source) {
    case 'body':
      return ctx.request?.body as Record<string, unknown> ?? {}
    case 'cookies':
      return parseCookie(ctx.headers?.cookie ?? '')
    case 'params':
      return ctx.params ?? {}
    case 'query':
      return ctx.request?.query ?? {}
    case 'state':
      return ctx?.state
  }
}

const parseCookie = (str: string): Record<string, string> =>
  str
    .split(';')
    .map(v => v.split('='))
    .reduce<any>((acc, v) => {
    acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
    return acc
  }, {})

const reportCustomError = async (error: joi.ValidationError): Promise<any> => {
  throw new UnprocessableEntity(
    ErrorCode.INVALID_INPUT,
    ErrorDescription.INVALID_INPUT,
    error.details
  ).withRootError(error)
}
