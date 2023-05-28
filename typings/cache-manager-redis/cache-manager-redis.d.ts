
module 'cache-manager-redis' {
  import { type Cache, type Store, type FactoryConfig } from 'cache-man  er/dist/index.js'
  export function create <T> (config?: FactoryConfig<T>): Cache<Store>
}
