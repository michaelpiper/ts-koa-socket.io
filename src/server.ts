import { type SERVER_MODE } from './common/config/config.js'
import loaders from './loaders/index.js'
void (async () => {
  const SERVER_MODE: SERVER_MODE = 'combine'
  const SERVER_APP = '*'
  const server = await loaders({
    SERVER_MODE,
    SERVER_APP
  })
  server.listen()
})()
