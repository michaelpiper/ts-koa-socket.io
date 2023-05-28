import { ArtifactFactory } from '../../factories/artifact.factory.js'

export class SuccessArtifact extends ArtifactFactory {
  protected readonly _statusCode = 200
  protected readonly _message = 'success'
}
