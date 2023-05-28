import { Todo } from '../models/todo.model.js'
import { TodoList } from '../models/todoList.model.js'
import { type RedisPlugin } from '../../../common/plugins/redis.plugin.js'
import type socketIo from 'socket.io'
export class TodoService {
  constructor (protected socket: socketIo.Server, protected redisServer: RedisPlugin) {
  }

  storeTodoToModel = async (task: string, isCompleted: boolean): Promise<Todo> => {
    const newTodo = new Todo(task, isCompleted)
    const socketId = await this.redisServer.getValueWithKey('SAMPLE_PLATFORM@2')
    if (socketId !== null) {
      this.socket.to(socketId).emit('new_todo', newTodo)
    }
    return newTodo
  }

  getSampleList = (): Todo[] => {
    const todoList = new TodoList()
    return todoList.seeds()
  }
}
