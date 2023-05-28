import { ErrorFactory } from '../../factories/error.factory.js'

export class NotFound extends ErrorFactory {
  public readonly statusCode: number = 404
}
