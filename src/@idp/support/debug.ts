import * as querystring from 'node:querystring'
import { inspect } from 'node:util'
import isEmpty from 'lodash/isEmpty.js'
const keys = new Set()
export const debugIdpProvider = (obj: Record<any, any>) => querystring.stringify(Object.entries(obj).reduce<Record<any, any>>((acc, [key, value]) => {
  keys.add(key)
  if (isEmpty(value)) { return acc }
  acc[key] = inspect(value, { depth: null })
  return acc
}, {}), '<br/>', ': ', {
  encodeURIComponent (value) { return keys.has(value) ? `<strong>${value}</strong>` : value }
})
