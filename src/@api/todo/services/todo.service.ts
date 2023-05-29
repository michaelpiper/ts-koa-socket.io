import { Todo } from '../models/todo.model.js'
import { TodoList } from '../models/todoList.model.js'
import { type RedisPlugin } from '../../../common/plugins/redis.plugin.js'
import type socketIo from 'socket.io'
import { type TodoEntity } from '../entities/todo.entity.js'
import { type Repository } from 'typeorm'
import { type Queue } from 'bull'
export class TodoService {
  constructor (protected queue: Queue<Todo>, protected repository: Repository<TodoEntity>, protected socket: socketIo.Server, protected redisServer: RedisPlugin) {
  }

  storeTodoToModel = async (task: string, isCompleted: boolean): Promise<Todo> => {
    const socketId = await this.redisServer.getValueWithKey('SAMPLE_PLATFORM@2')
    const todo = this.repository.create({
      task,
      isCompleted
    })
    await todo.save()
    const newTodo = new Todo(todo.task, todo.isCompleted, todo.id)
    if (socketId !== null) {
      this.socket.to(socketId).emit('new_todo', newTodo)
    }
    await this.queue.add(newTodo)
    return newTodo
  }

  getSampleList = (): Todo[] => {
    const todoList = new TodoList()
    return todoList.seeds()
  }

  getList = async (): Promise<Todo[]> => {
    const todoList = await this.repository.find()
    return todoList.map((todo) => (new Todo(todo.task, todo.isCompleted, todo.id)))
  }
}
