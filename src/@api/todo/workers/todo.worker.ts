import { type Job, type DoneCallback } from 'bull'
import { WorkerFactory } from '../../../factories/worker.factory.js'
import { type Todo } from '../models/todo.model.js'

export class TodoWorker extends WorkerFactory<Todo> {
  async processor (job: Job<any>, done: DoneCallback, log: (row: string) => Promise<any>): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
