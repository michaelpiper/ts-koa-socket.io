import { AddonConfig } from '../../factories/addon.config.js'
import { TodoEntity } from '../../@api/todo/entities/todo.entity.js'
import { type Request, type Response } from 'express'
import { type AdminJSOptions, type PageContext } from 'adminjs'
export class AdminAddonConfig extends AddonConfig {
  get watchAdmin () {
    return this.config.get<string>('ADMIN_WATCH', 'off') === 'on'
  }

  get userName () {
    return this.config.get<string>('ADMIN_AUTH_USER', '')
  }

  get userAvatarUrl () {
    return this.config.get<string | null>('ADMIN_USER_ROOT_AVATAR_URL', null)
  }

  get userTitle () {
    return this.config.get<string>('ADMIN_USER_ROOT_TITLE', 'Root Admin')
  }

  get userRole () {
    return this.config.get<string>('ADMIN_USER_ROOT_ROLE', 'root')
  }

  get userID () {
    return this.config.get<string>('ADMIN_USER_ROOT_ID', '0')
  }

  get theme () {
    return this.config.get<string>('ADMIN_USER_ROOT_THEME', 'default')
  }

  get userEmail () {
    return this.config.get<string>('ADMIN_USER_ROOT_EMAIL')
  }

  get password () {
    return this.config.get<string>('ADMIN_AUTH_PASS', '')
  }

  get secureSession () {
    return this.config.get<string>('ADMIN_SECURE_SESSION', 'false') === 'true'
  }

  get sessionKeys () {
    return this.config.appKeys
  }

  get auth () {
    return {
      user: this.userName,
      pass: this.password
    }
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
