import { type ErrorCode, type ErrorDescription } from '../common/constants.js'
import { type ErrorMessage } from '../common/types.js'

export abstract class ErrorFactory extends Error {
  public readonly statusCode: number | undefined
  protected readonly _contentType: string = 'application/json'
  #cause?: Error
  constructor (
    public errorCode: ErrorCode,
    public errorDescription: ErrorDescription,
    public errorMessage: ErrorMessage
  ) {
    super()

    this.errorCode = errorCode
    this.errorDescription = errorDescription
    this.errorMessage = errorMessage
  }

  get contentType (): string {
    return this._contentType
  }

  /**
 *
 * @param {Error} cause
 * @description
 *  Error messages written for human consumption may be inappropriate for machine parsing — since they're subject to rewording or punctuation changes that may break any existing parsing written to consume them. So when throwing an error from a function, as an alternative to a human-readable error message, you can instead provide the cause as structured data, for machine parsing.
 */
  withRootError (cause?: Error): this {
    this.#cause = cause
    return this
  }

  get _cause (): Error | undefined {
    return this.#cause
  }
}
