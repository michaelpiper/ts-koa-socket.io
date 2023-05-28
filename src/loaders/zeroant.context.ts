import Koa from 'koa'
import { createServer, type Server } from 'http'
import { InternalServerError } from '../responses/serverErrors/InternalServerError.serverError.js'
import { ErrorCode, ErrorDescription } from '../common/constants.js'
import { type RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ServerFactoryConstructor, type ServerFactory } from '../factories/server.factory.js'
import { type Config } from '../common/config/config.js'
import { type Plugin } from '../common/plugins/plugin.js'
import mount from 'koa-mount'
export class ZeroantContext {
  static PORT = 8080
  _app: Koa
  protected _server: Server
  protected _port: number
  #store = new Map()
  _servers: ServerFactory[] = []
  constructor () {
    this._app = new Koa()
  }

  initRoutes (routes: RegistryRouteEntryFactory[]) {
    for (const route of routes) {
      if (route.router instanceof Koa) {
        this._app
          .use(mount(route.name, route.router))
      } else {
        this._app
          .use(mount(route.name, route.router.routes()))
          .use(mount(route.name, route.router.allowedMethods()))
      }
    }
  }

  initMiddleware (middlewareList: Koa.Middleware[]) {
    for (const middleware of middlewareList) {
      this._app.use(middleware)
    }
  }

  listen (callback?: () => void): void {
    this.beforeStart()
    const config = this.getConfig()
    this._port = config.serverPort ?? ZeroantContext.PORT
    this._server = createServer(this._app.callback() as any)
    this._server.listen(this._port, () => {
      this.onStart()
      if (typeof callback === 'function') {
        callback()
      }
    })
  }

  onStart () {
    console.log('Running Zeroant Server on port %s', this._port)
    for (const server of this._servers) {
      server.onStart()
    }
  }

  beforeStart () {
    for (const server of this._servers) {
      server.beforeStart()
    }
  }

  has (key: string) {
    return this.#store.get(key) !== undefined && this.#store.get(key) !== null
  }

  close () {
    for (const server of this._servers) {
      server.close()
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this._server) {
      return
    }
    this._server.close((err) => {
      if (err != null) { throw Error() }
      console.info(new Date(), '[ZeroantContext]: Stopped')
    })
  }

  initServer (Server: ServerFactoryConstructor<ServerFactory>) {
    const server = new Server(this)
    server.initialize()
    this._servers.push(server)
    this.#store.set(`server:${Server.name}`, server)
  }

  getServer <T extends ServerFactory>(Server: ServerFactoryConstructor<T>): T {
    const server = this.#store.get(`server:${Server.name}`)
    if (server === null || server === undefined) {
      throw new InternalServerError(ErrorCode.SERVER_EXCEPTION, ErrorDescription.SERVER_EXCEPTION, `${Server.name} Server Not Init`)
    }
    return server
  }

  async initPlugin (plugin: Plugin) {
    this.#store.set('plugin', plugin)
    await plugin.initialize()
  }

  getPlugin () {
    const plugin: Plugin = this.#store.get('plugin')
    if (plugin === null || plugin === undefined) {
      throw new InternalServerError(ErrorCode.SERVER_EXCEPTION, ErrorDescription.SERVER_EXCEPTION, 'Plugin Not Init')
    }
    return plugin
  }

  async initConfig (config: Config) {
    this.#store.set('config', config)
  }

  getConfig () {
    const config = this.#store.get('config')
    if (config === null || config === undefined) {
      throw new InternalServerError(ErrorCode.SERVER_EXCEPTION, ErrorDescription.SERVER_EXCEPTION, 'Config Not Init')
    }
    return config
  }

  get server (): Server { return this._server }
  get plugin (): Plugin { return this.getPlugin() }
  get config (): Config { return this.getConfig() }
  get instance (): Koa { return this._app }
}
