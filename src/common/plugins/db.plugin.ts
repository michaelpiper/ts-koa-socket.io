import { AddonPlugin } from '../../factories/addon.plugin.js'
import { DBAddonConfig } from '../addons/db.addon.config.js'
import { DataSource } from 'typeorm'
export class DBPlugin extends AddonPlugin {
  protected _dataSource: DataSource
  async initialize () {
    const options = this.context.config.addons.get(DBAddonConfig).options
    const dataSource = new DataSource(options)
    this._dataSource = dataSource
    await dataSource.initialize()
  }

  get instance (): DataSource {
    return this._dataSource
  }

  clone () {
    const options = this.context.config.addons.get(DBAddonConfig).options
    const dataSource = new DataSource(options)
    return dataSource
  }
}
