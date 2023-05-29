import AdminJS from 'adminjs'
import type Router from 'koa-router'
import AdminJSKoa from '@adminjs/koa'
import * as AdminJSTypeorm from '@adminjs/typeorm'
import { InternalServerError } from '../responses/serverErrors/InternalServerError.serverError.js'
import { ErrorCode, ErrorDescription, ServerEventType } from '../common/constants.js'
import { AdminAddonConfig } from '../common/addons/admin.addon.config.js'
import { type ZeroantContext } from '../loaders/zeroant.context.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
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
    const options = this.context.config.addons.get(AdminAddonConfig).options
    const mountPoint = this.context.getMountPoint(this.name)
    const admin = new AdminJS({ ...options, rootPath: mountPoint })
    this.admin = admin
    this.context.event.on(ServerEventType.START, () => { this.onStart() })
    this.router = AdminJSKoa.buildRouter(admin, this.context.instance)
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
