import type Router from 'koa-router'
import type Koa from 'koa'
import { type ZeroantContext } from '../loaders/zeroant.context.js'
import { type AddonConfigFactory } from './addon.config.js'
import { type AddonPluginFactory } from './addon.plugin.js'
import { type ServerFactory, type ServerFactoryConstructor } from './server.factory.js'
import { type WorkerFactory, type WorkerFactoryConstructor } from './worker.factory.js'

export abstract class RegistryRouteEntryFactory {
  name: string
  abstract router: Router | Koa
  /**
   * @description
   * In routing, the dynamic route refers to a routing entry or path that is automatically updated and adjusted by routing protocols based on real-time network conditions.
   * These routing protocols allow routers in a network to exchange information and make decisions on the best path to forward network traffic.
   * The term "dynamicRoute name" could refer to the name or identifier assigned to a specific dynamic route within a routing table or configuration.
   * This name helps identify and differentiate the dynamic route from other routes in the network.
   * The dynamicRoute is default to false which means the server will ignore the name property.
   */
  dynamicRoute: boolean = false
  constructor (protected context: ZeroantContext) {
  }

  buildRoutes () {
  }
}

export default abstract class RegistryFactory {
  static readonly configs: AddonConfigFactory[]
  abstract readonly plugins: AddonPluginFactory[]
  abstract readonly servers: Array<ServerFactoryConstructor<ServerFactory>>
  abstract readonly middleware: Koa.Middleware[]
  abstract readonly routes: RegistryRouteEntryFactory[]
  abstract readonly workers: Array<WorkerFactoryConstructor<WorkerFactory<any>>>
}
