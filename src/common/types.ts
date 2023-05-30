import { type CurrentAdmin } from 'adminjs'
import { type opts as SessionOptions } from 'koa-session'
/**
 * @memberof module:@adminjs/koa
 * @alias KoaAuthenticateFunction
 *
 * @description
 * An async authentication function, returning {@link CurrentAdmin}
 *
 * @returns {Promise<CurrentAdmin>}
 */
export type KoaAuthenticateFunction = (
/**
 * email address passed in a form
 */
  email: string,
/**
 * Password passed in a form
 */
  password: string) => Promise<CurrentAdmin | null>
/**
 * @memberof module:@adminjs/koa
 * @alias KoaAuthOptions
 *
 * @description
 * Authentication options
 */
export interface KoaAuthOptions {
  /**
     * Function returning {@link CurrentAdmin}
     */
  authenticate: KoaAuthenticateFunction
  /**
     * Session options passed to koa-session
     */
  sessionOptions?: Partial<SessionOptions>
}

export type ErrorMessage = object | string | null | string[]
export type SuccessData = object | [] | null
