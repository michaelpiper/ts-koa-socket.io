import loaders from './loaders/index.js'
void (async () => {
  const SERVER_MODE = 'standalone'
  const SERVER_APP = '/admin'
  const SERVER_MOUNT_AS_ROOT = 'off'
  const server = await loaders({
    SERVER_MODE,
    SERVER_APP,
    SERVER_MOUNT_AS_ROOT
  })
  server.listen()
})()
