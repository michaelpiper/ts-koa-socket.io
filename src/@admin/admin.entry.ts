import AdminJS, { ComponentLoader } from 'adminjs'
import type Router from 'koa-router'
import AdminJSKoa from '@adminjs/koa'
import { type CurrentAdmin } from 'adminjs'
// import lodash from 'lodash'
import * as AdminJSTypeorm from '@adminjs/typeorm'
import { InternalServerError } from '../responses/serverErrors/internalServerError.serverError.js'
import { ErrorCode, ErrorDescription, ServerEventType } from '../common/constants.js'
import { AdminAddonConfig } from '../common/addons/admin.addon.config.js'
import { type ZeroantContext } from '../loaders/zeroant.context.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type KoaAuthOptions } from '../common/types.js'

export default class AdminServer extends RegistryRouteEntryFactory {
  router!: Router
  name = '/admin'
  dynamicRoute = true
  protected admin: AdminJS
  constructor (context: ZeroantContext) {
    super(context)
    AdminJS.registerAdapter({
      Resource: AdminJSTypeorm.Resource,
      Database: AdminJSTypeorm.Database
    })
    this.buildRoutes()
  }

  buildRoutes () {
    const config = this.context.config.addons.get(AdminAddonConfig)
    const options = config.options
    const componentLoader = new ComponentLoader()
    const mountPoint = this.context.getMountPoint(this.name)
    const Components = {
      Dashboard: componentLoader.add('Dashboard', this.context.config.appPath + '/@admin/dashboard/dashboard.js', 'rootBundle')
      // other custom components
    }
    options.dashboard = {
      component: Components.Dashboard
    }
    const admin = new AdminJS({
      ...options,
      rootPath: mountPoint,
      componentLoader
    })
    this.admin = admin

    // CurrentAdmin
    const auth: KoaAuthOptions = {
      sessionOptions: {
        secure: config.secureSession,
        key: config.sessionKeys.at(0)
      },
      authenticate: async (email: string, password: string): Promise<CurrentAdmin | null> => {
        if (email === config.userName && password === config.password) {
          return {
            email: config.userEmail,
            username: config.userName,
            title: config.userTitle,
            role: config.userRole,
            avatarUrl: config.userAvatarUrl ?? undefined,
            id: config.userID,
            theme: config.theme
          }
        }
        return null
      }
    }
    this.context.event.on(ServerEventType.START, () => { this.onStart() })
    this.router = AdminJSKoa.buildAuthenticatedRouter(admin, this.context.instance, auth)
  }

  onStart () {
    const admin = this.admin
    const watchAdmin = this.context.config.addons.get(AdminAddonConfig).watchAdmin
    if (watchAdmin) {
      admin.watch().catch((rootError) => {
        const error = new InternalServerError(
          ErrorCode.IMPLEMENTATION_EXCEPTION,
          ErrorDescription.IMPLEMENTATION_EXCEPTION,
          'Admin watch has implementation error'
        ).withRootError(rootError)
        throw error
      })
    }
    console.log(`AdminJS started on http://localhost:${this.context.config.serverPort}${admin.options.rootPath}`)
  }
}
