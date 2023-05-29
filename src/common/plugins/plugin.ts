import { ErrorCode, ErrorDescription } from '../constants.js'
import { InternalServerError } from '../../responses/serverErrors/internalServerError.serverError.js'
import { type ZeroantContext } from '../../loaders/zeroant.context.js'
import { type AddonPluginConstructor, type AddonPlugin } from '../../factories/addon.plugin.js'
export class Plugin {
  private readonly _addons = new Set<AddonPlugin>()
  constructor (private readonly context: ZeroantContext) { }
  get <T extends AddonPlugin>(Type: AddonPluginConstructor<T>): T {
    for (const addon of this._addons.values()) {
      if (addon instanceof Type) {
        return addon
      }
    }
    throw new InternalServerError(
      ErrorCode.UNIMPLEMENTED_EXCEPTION,
      ErrorDescription.UNIMPLEMENTED_EXCEPTION,
      `${Type.name} you trying to get is not implemented`
    )
  }

  add (Addon: AddonPluginConstructor<AddonPlugin>): this {
    this._addons.add(new Addon(this.context))
    return this
  }

  async initialize (): Promise<void> {
    try {
      for (const addon of this._addons.values()) {
        await addon.initialize()
      }
    } catch (error: any) {
      throw new InternalServerError(
        ErrorCode.UNEXPECTED_ERROR,
        ErrorDescription.UNEXPECTED_ERROR,
        `Error while initializing plugins: ${error.message as string}`
      ).withRootError(error)
    }
  }
}
