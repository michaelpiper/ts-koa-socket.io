import Koa from 'koa'
import { IdpMiddleware } from './idp.middleware.js'
import * as path from 'node:path'
import idpProvider from './idp.provider.js'
import interactionRouter from './account/routes/interaction.route.js'
import zeroant from '../loaders/zeroant.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ZeroantContext } from 'loaders/zeroant.context.js'
import mount from 'koa-mount'
import views from 'koa-views'
import bodyParser from 'koa-bodyparser'
export default class IdpRouteEntry extends RegistryRouteEntryFactory {
  router = new Koa()
  name = '/idp'
  middleware: IdpMiddleware
  constructor (context: ZeroantContext) {
    super(context)
    this.context = context
    this.middleware = new IdpMiddleware()
    this.buildRoutes()
  }

  buildRoutes () {
    this.router.use(bodyParser())
    if (zeroant.config.isProd) {
      idpProvider.proxy = true
      this.router.use(this.middleware.idpUrlFormatter)
    }

    this.router.use(views(path.join(this.context.config.absPath, 'templates/idp'), {
      map: { ejs: 'ejs' },
      extension: 'ejs',
      autoRender: false,
      options: {
        layout: path.join(this.context.config.absPath, 'templates/idp/_layout')
      }
    }))

    this.router.use(this.middleware.updateViewLayout)
    this.router
      .use(mount(interactionRouter.routes()))
      .use(mount(interactionRouter.allowedMethods()))
    this.router.use(mount(idpProvider.app))
  }
}
