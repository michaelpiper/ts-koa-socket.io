import { ErrorFactory } from '../../factories/error.factory.js'
export class Forbidden extends ErrorFactory {
  public readonly statusCode: number = 403
}
