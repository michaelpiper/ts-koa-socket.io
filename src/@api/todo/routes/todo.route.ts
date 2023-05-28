/* eslint-disable @typescript-eslint/no-misused-promises */
import Router from 'koa-router'
import { TodoApiController } from '../controllers/todo.controller.js'
import { storeValidation } from '../validations/todo.validation.js'
import validationHandler from '../../../responses/validationHandler.js'
const router = new Router({
  prefix: '/todos'
})
const controller = new TodoApiController()
router.post('/store', validationHandler(storeValidation, { sources: ['body'] }), controller.store)
router.get('/list', controller.list)
export default router
