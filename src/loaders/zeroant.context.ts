import Koa from 'koa'
import { createServer, type Server } from 'http'
import { InternalServerError } from '../responses/serverErrors/internalServerError.serverError.js'
import { ErrorCode, ErrorDescription, ServerEventType } from '../common/constants.js'
import { type RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ServerFactoryConstructor, type ServerFactory } from '../factories/server.factory.js'
import { type Config } from '../common/config/config.js'
import { type Plugin } from '../common/plugins/plugin.js'
import mount from 'koa-mount'
import { EventEmitter } from 'events'
import { type WorkerFactoryConstructor, type WorkerFactory } from '../factories/worker.factory.js'
export class ZeroantContext {
  static PORT = 8080
  _app: Koa
  protected _server: Server
  protected _port: number
  #store = new Map()
  #workers = new Map<string, WorkerFactory<any>>()
  #event = new EventEmitter()
  _servers: ServerFactory[] = []
  constructor () {
    this._app = new Koa()
  }

  initWorkers (workers: Array<WorkerFactoryConstructor<WorkerFactory<any>>>) {
    for (const Worker of workers) {
      const worker = new Worker(this)
      this.#workers.set(worker.name, worker)
    }
  }

  getWorkerByName <T extends WorkerFactory<any> >(workerName: string): T | undefined {
    return this.#workers.get(workerName) as T ?? null
  }

  getWorkerNames (): IterableIterator<string> {
    return this.#workers.keys()
  }

  get workers () {
    return {
      get: <T extends WorkerFactory<any>>(Worker: WorkerFactoryConstructor<T>) => this.getWorker<T>(Worker)
    }
  }

  getWorker <T extends WorkerFactory<any> >(Worker: WorkerFactoryConstructor<T>): T {
    for (const worker of this.#workers.values()) {
      if (worker instanceof Worker) {
        return worker
      }
    }
    throw new InternalServerError(
      ErrorCode.UNIMPLEMENTED_EXCEPTION,
      ErrorDescription.UNIMPLEMENTED_EXCEPTION,
      'Worker not found'
    )
  }

  initRoutes (routes: RegistryRouteEntryFactory[]) {
    const apps = this.config.serverApp.split(',')
    const mode = this.config.serverMode
    console.log('Server App', apps)
    console.log('Server Mode', mode)
    for (const route of routes) {
      const mountPoint = this.getMountPoint(route.name, apps)
      if (mode === 'combine') {
        this._initRoute(mountPoint, route)
      } else if (mode === 'standalone') {
        if (apps.includes(route.name)) {
          this._initRoute(mountPoint, route)
        }
      }
    }
  }

  isStandAlone (appName: string, _apps?: string[]): boolean {
    if (this.config.serverMode !== 'standalone') {
      return false
    }
    const apps = _apps ?? this.config.serverApp.split(',')
    return apps.includes(appName)
  }

  getMountPoint (appName: string, _apps?: string[]): string {
    const apps = _apps ?? this.config.serverApp.split(',')
    return this.config.serverMountAsRoot && this.isStandAlone(appName, apps) ? '/' : appName
  }

  protected _initRoute (mountPoint: string, route: RegistryRouteEntryFactory) {
    console.log(`Mounting app ${route.name} on ${mountPoint}`)
    if (route.router instanceof Koa) {
      if (route.dynamicRoute) {
        // ignore rootPath since it already or probably defined by the app
        return this._app
          .use(mount(route.router))
      }
      return this._app
        .use(mount(mountPoint, route.router))
    }
    if (route.dynamicRoute) {
      // ignore rootPath since it already or probably defined by the route
      return this._app
        .use(mount(route.router.routes()))
        .use(mount(route.router.allowedMethods()))
    }
    return this._app
      .use(mount(mountPoint, route.router.routes()))
      .use(mount(mountPoint, route.router.allowedMethods()))
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
    this._app.keys = config.appKeys
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
    this.event.emit(ServerEventType.START)
  }

  beforeStart () {
    for (const server of this._servers) {
      server.beforeStart()
    }
    this.event.emit(ServerEventType.BEFORE_START)
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

  getConfig (): Config {
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
  get event (): EventEmitter { return this.#event }
}
