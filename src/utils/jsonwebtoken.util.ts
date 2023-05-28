import * as jwt from 'jsonwebtoken'
import { VerifyTokenStatus, Platform } from '../common/constants.js'
import zeroant from '../loaders/zeroant.js'
export const verifyTokenSignature = (accessToken: string, publicKey: string): VerifyTokenStatus => {
  if (accessToken === undefined || accessToken === null) {
    return VerifyTokenStatus.ACCESS_TOKEN_NOTFOUND
  }
  try {
    jwt.verify(accessToken, publicKey, { algorithms: ['RS256'] })
    return VerifyTokenStatus.SUCCESS
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return VerifyTokenStatus.TOKEN_EXPIRED
    }
    return VerifyTokenStatus.SIGNATURE_VERIFICATION_FAILURE
  }
}
export const platforms = (audience: string | undefined): Platform | undefined => {
  const samplePlatformAudience = zeroant.getConfig().samplePlatformAudience
  switch (audience) {
    case samplePlatformAudience:
      return Platform.SAMPLE_PLATFORM
    default:
      return undefined
  }
}
