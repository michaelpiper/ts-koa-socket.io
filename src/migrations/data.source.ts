import { DBPlugin } from '../common/plugins/db.plugin.js'
import loaders from '../loaders/index.js'
const server = await loaders()
export default server.plugin.get(DBPlugin).clone()
