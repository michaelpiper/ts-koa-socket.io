import { ArtifactFactory } from '../../factories/artifact.factory.js'
export class CreateArtifact extends ArtifactFactory {
  protected readonly _statusCode = 201
  protected readonly _message = 'created'
}
