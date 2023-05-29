import { AddonConfig } from '../../factories/addon.config.js'
import { TodoEntity } from '../../@api/todo/entities/todo.entity.js'
import { type Request, type Response } from 'express'
import { type AdminJSOptions, type PageContext } from 'adminjs'
export class AdminAddonConfig extends AddonConfig {
  get watchAdmin () {
    return this.config.get<string>('ADMIN_WATCH', 'off') === 'on'
  }

  get options () {
    return this._options()
  }

  _options (): AdminJSOptions {
    return {
      rootPath: '/admin',
      resources: [{
        resource: TodoEntity,
        options: {
          parent: {
            name: 'Dashboard',
            icon: ''
          }
        }
      }],
      settings: {},
      branding: {
        companyName: 'ZeroAnt',
        withMadeWithLove: false
      },
      pages: {
        customPage: {
          icon: 'Custom page',
          handler: async (_request: Request, _response: Response, _context: PageContext) => {
            return {
              text: 'I am fetched from the backend'
            }
          },
          component: 'CustomPage'
        }
      }
    }
  }
}
