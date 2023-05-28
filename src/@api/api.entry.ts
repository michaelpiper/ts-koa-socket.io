
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import ApiMiddleware from './api.middleware.js'
import todoListRoutes from './todo/routes/todo.route.js'
import errorHandler from '../responses/errorHandler.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ZeroantContext } from '../loaders/zeroant.context.js'
import cors from '@koa/cors'
import responseHandler from '../responses/responseHandler.js'
export default class ApiRouteEntry extends RegistryRouteEntryFactory {
  middleware = new ApiMiddleware()
  public router: Router = new Router()
  public name = '/api'
  constructor (readonly context: ZeroantContext) {
    super(context)
    this.buildRoutes()
  }

  buildRoutes () {
    this.router.use(bodyParser({ jsonLimit: '1mb' }))
    this.router.use(cors())
    this.router.use(errorHandler())
    this.router.use(responseHandler())
    this.router.use(todoListRoutes.routes(), todoListRoutes.allowedMethods())
    this.router.use(this.middleware.apiRouteNotFound)
  }
}
