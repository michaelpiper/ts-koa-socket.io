import { type ISuccessResponse } from '../common/interfaces/responses.js'
import { type SuccessData } from '../common/types.js'

export abstract class ArtifactFactory {
  protected readonly _statusCode: number = 200
  protected readonly _message: string = 'success'
  protected readonly _contentType: string = 'application/json'
  constructor (protected readonly _data: SuccessData = null) {
  }

  get status (): number {
    return this._statusCode
  }

  get contentType (): string {
    return this._contentType
  }

  get data (): ISuccessResponse {
    const response = {
      status: this._statusCode,
      message: this._message
    }
    if (this._data === null) {
      return response
    }
    return {
      status: this._statusCode,
      message: this._message,
      data: this._data
    }
  }
}
