import { ErrorFactory } from '../../factories/error.factory.js'

export class Unauthorized extends ErrorFactory {
  public readonly statusCode: number = 401
}
