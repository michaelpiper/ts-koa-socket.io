import { type DataSourceOptions } from 'typeorm'
import { AddonConfig } from '../../factories/addon.config.js'
export type DBOptions = DataSourceOptions
export class DBAddonConfig extends AddonConfig {
  get development (): DBOptions {
    return {
      type: this.config.get<any>('DB_ENGINE', 'sqlite'),
      host: this.config.get('DB_HOST', null) ?? undefined,
      port: this.config.get('DB_PORT', null) ?? undefined,
      username: this.config.get('DB_PASSWORD', null) ?? undefined,
      password: this.config.get('DB_PASSWORD', null) ?? undefined,
      database: this.config.get('DB_DATABASE', this.config.absPath + '/db.sqlite'),
      entities: ['**/*.entity.js'],
      migrations: ['**/*-migration.js']
    }
  }

  get production (): DBOptions {
    return {
      type: this.config.get<any>('PROD_DB_ENGINE', 'sqlite'),
      host: this.config.get('PROD_DB_HOST', null) ?? undefined,
      port: this.config.get('PROD_DB_PORT', null) ?? undefined,
      username: this.config.get('PROD_DB_PASSWORD', null) ?? undefined,
      password: this.config.get('PROD_DB_PASSWORD', null) ?? undefined,
      database: this.config.get('PROD_DB_DATABASE', this.config.absPath + '/db.sqlite'),
      entities: ['**/*.entity.js'],
      migrations: ['**/*-migration.js']
    }
  }

  get test (): DBOptions {
    return {
      type: this.config.get<any>('TEST_DB_ENGINE', 'sqlite'),
      host: this.config.get('TEST_DB_HOST', null) ?? undefined,
      port: this.config.get('TEST_DB_PORT', null) ?? undefined,
      username: this.config.get('TEST_DB_PASSWORD', null) ?? undefined,
      password: this.config.get('TEST_DB_PASSWORD', null) ?? undefined,
      database: this.config.get('TEST_DB_DATABASE', this.config.absPath + '/db.sqlite'),
      entities: ['**/*.entity.js'],
      migrations: ['**/*-migration.js']
    }
  }

  get watchAdmin () {
    return this.config.get<string>('ADMIN_WATCH', 'off') === 'on'
  }

  get options (): DBOptions {
    switch (this.config.environment) {
      case 'production':
        return this.production
      case 'test':
        return this.test
      default:
        return this.development
    }
  }
}
