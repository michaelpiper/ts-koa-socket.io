import * as socketIo from 'socket.io'
import * as jwt from 'jsonwebtoken'
import { getPlatformPublicKey } from '../../utils/storage.util.js'
import { type Platform, SocketEvent, VerifyTokenStatus } from '../constants.js'
import { verifyTokenSignature, platforms } from '../../utils/jsonwebtoken.util.js'
import { ServerFactory } from '../../factories/server.factory.js'
import { RedisPlugin } from '../plugins/redis.plugin.js'
import { type ZeroantContext } from '../../loaders/zeroant.context.js'
import { type IDecodedToken } from '../interfaces/jsonwebtoken.js'
export class SocketServer extends ServerFactory {
  private readonly _io
  private readonly _redis
  constructor (context: ZeroantContext) {
    super(context)
    const serverInstance = context.server
    const redis = context.plugin.get(RedisPlugin).instance
    this._io = new socketIo.Server(serverInstance)
    this._redis = redis
  }

  initialize () {
  }

  onStart () {
    this.listen()
  }

  listen () {
    this._io.use((socket, next) => {
      // token format verification
      const socketAccessToken: string = socket.handshake.query.token as string
      const decodedToken: IDecodedToken = jwt.decode(socketAccessToken) as IDecodedToken
      if (decodedToken === null) {
        socket.disconnect()
        return
      }

      // identify whether the token is from our platform
      const { aud: tokenAudience, sub: tokenSubscriber } = decodedToken
      const assignedPlatform: Platform | undefined = platforms(tokenAudience)
      if (assignedPlatform === undefined) {
        socket.disconnect()
        return
      }

      // verify the signature of token with public key assigned to specific platform
      const publicKey: string = getPlatformPublicKey(assignedPlatform)
      const verifyOutcome: VerifyTokenStatus = verifyTokenSignature(
        socketAccessToken, publicKey
      )

      switch (verifyOutcome) {
        case VerifyTokenStatus.ACCESS_TOKEN_NOTFOUND:
          socket.disconnect()
          return
        case VerifyTokenStatus.SIGNATURE_VERIFICATION_FAILURE:
          socket.disconnect()
          return
        case VerifyTokenStatus.TOKEN_EXPIRED:
          socket.disconnect()
          return
        case VerifyTokenStatus.SUCCESS:
          break
        default:
          socket.disconnect()
          return
      }

      (socket as any).platform = assignedPlatform as Platform
      (socket as any).subscriber = tokenSubscriber

      next()
    })
      .on(SocketEvent.CONNECT, (socket: any) => {
        // Get socket id and sub from client, then store to redis
        const socketId: string = socket.id
        const sub: string = socket.subscriber
        const platform: string = socket.platform
        const platformSubscriber = `${platform.toUpperCase()}@${sub}`
        this._redis.set(platformSubscriber, socketId)

        // remove sub from redis once disconnect
        socket.on(SocketEvent.DISCONNECT, () => {
          this._redis.del(platformSubscriber)
        })
      })

    console.log('Running Socket Server is listening.')
  }

  close () {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this._io) {
      return
    }
    this._io.on('end', (socket) => {
      socket.disconnect(0)
      console.info(new Date(), '[SocketServer]: Disconnect')
    })
  }

  get instance (): socketIo.Server {
    return this._io
  }
}
