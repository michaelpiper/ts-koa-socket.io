import joi from 'joi'
export const storeValidation = joi.object({
  task: joi.string().required(),
  isCompleted: joi.boolean().optional().default(false)
})
