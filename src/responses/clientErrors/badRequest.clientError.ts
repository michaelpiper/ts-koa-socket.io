import { ErrorFactory } from '../../factories/error.factory.js'
export class BadRequest extends ErrorFactory {
  public readonly statusCode: number = 400
}
