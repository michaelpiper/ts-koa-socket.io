#!/usr/bin/env node

import { Command } from 'commander'
import { spawn } from 'child_process'
import type * as events from 'events'
import { type SERVER_MODE } from './common/config/config.js'
import loaders from './loaders/index.js'

const program = new Command()
const workers: Record<string, any & events.EventEmitter> = {}
const createWorker = (name: string) => {
  workers[name] = spawn('npm', ['run', 'worker', 'start', name], {
    cwd: process.cwd()
  })
  workers[name].stdout.on('data', (data: string) => {
    console.log(`[worker ${name} info]: ${data}`)
  })
  workers[name].stderr.on('data', (data: string) => {
    console.log(`[worker ${name} err]: ${data}`)
  })
  workers[name].on('error', (error: Error) => {
    console.log(`[worker ${name} error]: ${error.message}`)
  })
  workers[name].on('close', (code: number) => {
    console.log(`[worker ${name} exit]: child process exited with code ${code}`)
    workers[name] = createWorker(name)
  })
  return workers[name]
}
// Worker
program
  .name('worker')
  .description('CLI to some Worker utilities')
  .version('0.1.0')

program
  .command('start')
  .argument('[worker]', 'Start worker')
  .action(async function (workerName?: string) {
    const SERVER_MODE: SERVER_MODE = 'standalone'
    const SERVER_APP = 'worker'
    const zeroant = await loaders({
      SERVER_MODE,
      SERVER_APP
    })
    if (workerName !== null && workerName !== undefined && (workerName.length > 0)) {
      console.log('Start Worker', workerName)
      const worker = zeroant.getWorkerByName(workerName)
      if (worker === undefined || worker === null) {
        console.log('Worker Not Found', workerName)
        return
      }
      await worker.run()
    } else {
      console.log('Starting all Workers', zeroant.config.appName)
      for (const name of zeroant.getWorkerNames()) {
        console.log(name)
        createWorker(name)
        process.on('SIGINT', (code: number) => {
          workers[name].kill(code)
          process.exit(code)
        })
      }
    }
  })

program.parse()
