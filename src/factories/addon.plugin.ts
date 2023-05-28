import { type ZeroantContext } from '../loaders/zeroant.context.js'
export type AddonPluginConstructor<T extends AddonPlugin> = new (context: ZeroantContext) => T
export type AddonPluginFactory = AddonPluginConstructor<AddonPlugin>
export abstract class AddonPlugin {
  constructor (protected readonly context: ZeroantContext) {

  }

  async initialize (): Promise<void> {

  }
}
