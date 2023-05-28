import { resolve } from 'path'
import { readFileSync } from 'fs'
import { Platform } from '../common/constants.js'
import zeroant from '../loaders/zeroant.js'
export const getPlatformPublicKey = (platform: Platform): string => {
  const publicKeyObj = {
    [Platform.SAMPLE_PLATFORM]: zeroant.getConfig().samplePlatformPublicKey
  }
  const publicKeyPath = resolve(publicKeyObj[platform])
  const publicKey = readFileSync(publicKeyPath, 'utf-8')
  return publicKey
}
