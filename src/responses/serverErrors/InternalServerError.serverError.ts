import { ErrorFactory } from '../../factories/error.factory.js'
export class InternalServerError extends ErrorFactory {
  statusCode = 500
}
