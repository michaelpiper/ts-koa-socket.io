import AdminJS from 'adminjs'
import AdminJSKoa from '@adminjs/koa'
import * as AdminJSTypeorm from '@adminjs/typeorm'
import { InternalServerError } from '../../responses/serverErrors/InternalServerError.serverError.js'
import { ErrorCode, ErrorDescription } from '../constants.js'
import { AdminAddonConfig } from '../addons/admin.addon.config.js'
import { ServerFactory } from '../../factories/server.factory.js'
import { type ZeroantContext } from '../../loaders/zeroant.context.js'
export default class AdminServer extends ServerFactory {
  protected admin: AdminJS
  constructor (context: ZeroantContext) {
    super(context)
    AdminJS.registerAdapter({
      Resource: AdminJSTypeorm.Resource,
      Database: AdminJSTypeorm.Database
    })
  }

  initialize () {
    const options = this.context.config.addons.get(AdminAddonConfig).options
    const admin = new AdminJS(options)
    this.admin = admin
  }

  onStart () {
    const admin = this.admin
    const adminRouter = AdminJSKoa.buildRouter(admin, this.context.instance)
    this.context.instance
      .use(adminRouter.routes())
      .use(adminRouter.allowedMethods())
    const watchAdmin = this.context.config.addons.get(AdminAddonConfig).watchAdmin
    if (watchAdmin) {
      admin.watch().catch((rootError) => {
        const error = new InternalServerError(ErrorCode.IMPLEMENTATION_EXCEPTION, ErrorDescription.IMPLEMENTATION_EXCEPTION, 'Admin watch has implementation error').withRootError(rootError)
        throw error
      })
    }
    console.log(`AdminJS started on http://localhost:${this.context.config.serverPort}${admin.options.rootPath}`)
  }
}
