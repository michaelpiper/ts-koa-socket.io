/// <reference types="node" resolution-mode="require"/>
import { type AddonPluginFactory } from '../factories/addon.plugin.js';
import { type AddonConfigFactory } from '../factories/addon.config.js';
import RegistryFactory, { type RegistryRouteEntryFactory } from '../factories/registry.factory.js';
import AdminServer from './servers/admin.server.js';
import SocketServer from './servers/socket.server.js';
import type Config from './config/config.js';
import type ZeroantContext from 'loaders/zeroant.context.js';
export default class Registry extends RegistryFactory {
    protected context: ZeroantContext;
    config: Config;
    constructor(context: ZeroantContext);
    static configs: AddonConfigFactory[];
    plugins: AddonPluginFactory[];
    middleware: ((req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>, callback: (err?: Error | undefined) => void) => void)[];
    servers: (typeof SocketServer | typeof AdminServer)[];
    get routes(): RegistryRouteEntryFactory[];
}
