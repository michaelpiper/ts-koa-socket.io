import loaders from './loaders/index.js'
void (async () => {
  const server = await loaders()
  server.listen()
})()
