import zeroant from '../../loaders/zeroant.js'
import winston from 'winston'
export const logger = winston.createLogger({
  level: '',
  format: winston.format.json(),
  get defaultMeta () {
    return { get environment () { return zeroant.config.environment } }
  },
  transports: [
    new winston.transports.Console({ format: winston.format.prettyPrint() }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
