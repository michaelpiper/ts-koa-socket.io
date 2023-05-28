import { InteractionIdpController } from '../controllers/interaction.controller.js'
import idpProvider from '../../idp.provider.js'

import { InteractionIdpMiddleware } from '../middlewares/interaction.middleware.js'
import Router from 'koa-router'
const router = new Router({
  prefix: '/interaction'
})
const controller = new InteractionIdpController(idpProvider)
const middleware = new InteractionIdpMiddleware(idpProvider)
router.use(middleware.sessionError.bind(middleware))
router.get('/:uid', middleware.setNoCache.bind(middleware), controller.retrieve.bind(controller))
router.post('/:uid/login', middleware.setNoCache.bind(middleware), controller.accountLogin.bind(controller))
router.post('/:uid/confirm', middleware.setNoCache.bind(middleware), controller.accountConfirm.bind(controller))
router.get('/:uid/abort', middleware.setNoCache.bind(middleware), controller.accountAbort.bind(controller))
router.post('/:uid/federated', middleware.setNoCache.bind(middleware), controller.accountFederated.bind(controller))
router.post('/callback/google', middleware.setNoCache.bind(middleware), controller.callbackGoogle.bind(controller))
export default router
