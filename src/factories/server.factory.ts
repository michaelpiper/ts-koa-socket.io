
import { type ZeroantContext } from '../loaders/zeroant.context.js'
export type ServerFactoryConstructor<T extends ServerFactory> = new (context: ZeroantContext) => T
export abstract class ServerFactory {
  constructor (protected context: ZeroantContext) {

  }

  onStart (): void {
  }

  initialize (): void { }
  beforeStart (): void {
  }

  close (): void {
  }
}
