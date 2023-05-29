import { TodoService } from '../services/todo.service.js'
import { SuccessArtifact } from '../../../responses/artifacts/success.artifact.js'
import { RedisPlugin } from '../../../common/plugins/redis.plugin.js'
import zeroant from '../../../loaders/zeroant.js'
import { CacheManagerPlugin } from '../../../common/plugins/cacheManger.plugin.js'
import { TtlUtils } from '../../../utils/ttl.util.js'
import { BadRequest } from '../../../responses/clientErrors/badRequest.clientError.js'
import { ErrorCode, ErrorDescription } from '../../../common/constants.js'
import { logger } from '../../../common/logger/console.js'
import { SocketServer } from '../../../common/servers/socket.server.js'
import { type Context, type Next } from 'koa'
import { DBPlugin } from '../../../common/plugins/db.plugin.js'
import { TodoEntity } from '../entities/todo.entity.js'
import { type Todo } from '../models/todo.model.js'
import { TodoWorker } from '../workers/todo.worker.js'
export class TodoApiController {
  store = async (ctx: Context, next: Next) => {
    const { task, isCompleted } = ctx.request.result as Record<string, any>
    const socket = zeroant.getServer(SocketServer).instance
    const redis = zeroant.plugin.get(RedisPlugin)
    const db = zeroant.plugin.get(DBPlugin).instance
    const repository = db.getRepository(TodoEntity)
    const queue = zeroant.workers.get(TodoWorker).instance
    const todoService = new TodoService(queue, repository, socket, redis)
    const newTodo = await todoService.storeTodoToModel(task, isCompleted)
    if (newTodo == null) {
      throw new BadRequest(ErrorCode.INVALID_INPUT, ErrorDescription.INVALID_INPUT, 'Can not create todo list')
    }
    return new SuccessArtifact(newTodo)
  }

  list = async (ctx: Context, next: Next) => {
    const socket = zeroant.getServer(SocketServer).instance
    const redis = zeroant.plugin.get(RedisPlugin)
    const db = zeroant.plugin.get(DBPlugin).instance
    const repository = db.getRepository(TodoEntity)
    const queue = zeroant.workers.get(TodoWorker).instance
    const todoService = new TodoService(queue, repository, socket, redis)
    const cacheManager = zeroant.plugin.get(CacheManagerPlugin)
    const todoLists = await cacheManager.withStrategy<Todo[]>(async () => await todoService.getList()).cacheOrAsync('new-todo', TtlUtils.oneMinute)
    logger.info('todoLists', todoLists)
    return new SuccessArtifact(todoLists)
  }
}
