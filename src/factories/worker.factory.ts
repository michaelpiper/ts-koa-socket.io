import { type ZeroantContext } from '../loaders/zeroant.context.js'
import Queue, { type Job } from 'bull'
import { RedisPlugin } from '../common/plugins/redis.plugin.js'
export type WorkerFactoryConstructor<T extends WorkerFactory<any>> = new (context: ZeroantContext) => T
export abstract class WorkerFactory<T> {
  #queue: Queue.Queue
  options: Queue.JobOptions = {
    delay: 0,
    removeOnComplete: true
  }

  concurrency: number = 1
  constructor (readonly context: ZeroantContext) {
    this.#queue = new Queue<T>(this.name, {
      redis: this.context.plugin.get(RedisPlugin).options,
      defaultJobOptions: this.options ?? {}
    })
  }

  get name (): string {
    return this.constructor.name
  }

  get instance (): Queue.Queue<T> {
    return this.#queue
  }

  abstract processor (job: Queue.Job, done: Queue.DoneCallback, log: (row: string) => Promise<any>): Promise<void>

  async run (concurrency?: number) {
    const wrapper = this._wrapper(async (job: Queue.Job, done: Queue.DoneCallback, log: (row: string) => Promise<any>) => {
      await this.processor(job, done, log)
    })
    console.log(`${this.name} worker started successfully ${(new Date()).toLocaleString()}`)
    await this.#queue.process(concurrency ?? this.concurrency, wrapper)
  }

  async add (data: T, options?: Queue.JobOptions): Promise<Job<T>> {
    return await this.#queue.add(data, options)
  }

  addListener (eventName: string | symbol, listener: (...args: any[]) => void): Queue.Queue<T> {
    return this.#queue.addListener(eventName, listener)
  }

  async addBulk (bulkData: Array<{ name?: any, data: T, opts?: Omit<Queue.JobOptions, 'repeat'> | undefined }>): Promise<Job[]> {
    return await this.#queue.addBulk(bulkData)
  }

  _wrapper (callback: (job: Queue.Job, done: Queue.DoneCallback, log: (row: string) => Promise<any>) => Promise<void>) {
    return async (job: Queue.Job, done: Queue.DoneCallback): Promise<void> => {
      const start = Date.now()
      const { id } = job
      const data = job.data
      const log = job.log.bind(job)
      console.log('[-------------------------------------------]')
      console.log(`Processing ${this.name} Job: ${id} `)
      console.log(
        this.name + ' Worker Processor data ----->',
        JSON.stringify(data)
      )
      try {
        await callback(job, done, log)
      } catch (caught: any) {
        console.log(this.name + ' Worker Error -----> ', caught)
        await log((caught).message)
        done(caught)
      }
      console.log(`Job ${this.name} ${id} ran for ${(Date.now() - start) / 1000}s`)
      console.log('[-------------------------------------------]')
    }
  }
}
