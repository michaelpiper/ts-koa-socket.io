import { Unauthorized } from '../responses/clientErrors/unauthorized.clientError.js'
import jwt from 'jsonwebtoken'
import { ErrorDescription, VerifyTokenStatus, ErrorCode } from '../common/constants.js'
import { platforms, verifyTokenSignature } from '../utils/jsonwebtoken.util.js'
import { getPlatformPublicKey } from '../utils/storage.util.js'
import { type Context, type Next } from 'koa'
export default class ApiMiddleware {
  apiRouteNotFound = async (ctx: Context, next: Next): Promise<any> => {
    ctx.status = 400
    ctx.body = { message: 'not found' }
    return ctx.body
  }

  jsonWebToken = async (ctx: Context, next: Next): Promise<any> => {
    const { headers } = ctx.request
    if (headers.authorization === null || headers.authorization === undefined || headers.authorization === '') {
      throw new Unauthorized(ErrorCode.UNAUTHORIZED, ErrorDescription.UNAUTHORIZED, 'access token is required')
    }
    const accessToken = headers.authorization.replace('Bearer', '').trim()
    const decodedToken = jwt.decode(accessToken)
    if (decodedToken === null) {
      throw new Unauthorized(ErrorCode.INVALID_TOKEN_FORMAT, ErrorDescription.UNAUTHORIZED, 'invalid token')
    }
    const { aud: tokenAudience, sub: tokenSubscriber } = decodedToken as jwt.JwtPayload
    const assignedPlatform = platforms(tokenAudience as string)
    if (assignedPlatform === undefined) {
      throw new Unauthorized(ErrorCode.UNAUTHORIZED, ErrorDescription.UNAUTHORIZED, 'audience verification failed')
    }
    const publicKey = getPlatformPublicKey(assignedPlatform)
    const verifyOutcome = verifyTokenSignature(accessToken, publicKey)
    switch (verifyOutcome) {
      case VerifyTokenStatus.SIGNATURE_VERIFICATION_FAILURE:
        throw new Unauthorized(VerifyTokenStatus.SIGNATURE_VERIFICATION_FAILURE as any, ErrorDescription.UNAUTHORIZED, 'signature verification failed')
      case VerifyTokenStatus.TOKEN_EXPIRED:
        throw new Unauthorized(VerifyTokenStatus.TOKEN_EXPIRED as any, ErrorDescription.UNAUTHORIZED, 'access token expired')
      case VerifyTokenStatus.SUCCESS:
        break
      default:
        throw new Unauthorized(ErrorCode.SERVER_EXCEPTION, ErrorDescription.UNAUTHORIZED, 'access token expired')
    }
    ctx.state.subscriber = tokenSubscriber
    return await next()
  }
}
