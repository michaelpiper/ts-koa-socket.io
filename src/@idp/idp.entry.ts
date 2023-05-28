import Router from 'koa-router'
import IdpMiddleware from './idp.middleware.js'
import * as path from 'node:path'
import helmet from 'helmet'
import idpProvider from './idp.provider.js'
import interactionRouter from './account/routes/interaction.route.js'
import zeroant from '../loaders/zeroant.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ZeroantContext } from 'loaders/zeroant.context.js'
import views from 'koa-views'
import { promisify } from 'node:util'
import mount from 'koa-mount'
export default class ApiRouteEntry extends RegistryRouteEntryFactory {
  router = new Router({
    prefix: '/idp'
  })

  name = '/idp'
  middleware: IdpMiddleware
  directives: any
  constructor (context: ZeroantContext) {
    super(context)
    this.context = context
    this.middleware = new IdpMiddleware()
    this.directives = helmet.contentSecurityPolicy.getDefaultDirectives()
    delete this.directives['form-action']
    this.buildRoutes()
  }

  buildRoutes () {
    const pHelmet = promisify(helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: this.directives
      }
    }))
    this.router.use(async (ctx, next) => {
      const req = ctx.req as any
      const origSecure = req.secure
      req.secure = ctx.request.secure
      await pHelmet(ctx.req, ctx.res)
      req.secure = origSecure
      return await next()
    })
    this.router.use(views(path.join(this.context.config.absPath, 'views/idp')))
    const fileUrl = new URL('.', import.meta.url)
    console.log(path.join(fileUrl.pathname, 'views'))
    if (zeroant.config.isProd) {
      idpProvider.proxy = true
      this.router.use(this.middleware.idpUrlFormatter)
    }
    this.router.use(interactionRouter.routes(), interactionRouter.allowedMethods())
    this.router.use(mount(idpProvider.app))
  }
}
