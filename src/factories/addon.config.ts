import { type Config } from '../common/config/config.js'
export type AddonConfigConstructor<T extends AddonConfig> = new (config: Config) => T
export type AddonConfigFactory = AddonConfigConstructor<AddonConfig>
export abstract class AddonConfig {
  constructor (protected config: Config) {}
}
