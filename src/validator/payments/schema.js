const Joi = require('joi');

const FindByIdOrDeletePaymentSchema = Joi.object({
  id: Joi.number().positive().positive().unsafe(),
});

const FindAllPaymentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  userId: Joi.number().positive(),
  courseId: Joi.number().positive(),
});

const CreatePaymentSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  userId: Joi.number().positive(),
  amount: Joi.number().positive().allow(0).required(),
  discount: Joi.number().positive().allow(0).required(),
  descriptions: Joi.string().required(),
  paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH').required(),
  transactionDate: Joi.date().required(),
  status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED').required(),
  receiptUrl: Joi.string().required(),
});

const UpdatePaymentSchema = Joi.object({
  params: {
    id: Joi.number().positive().unsafe(),
  },
  body: {
    courseId: Joi.number().positive(),
    userId: Joi.number().positive(),
    amount: Joi.number().positive(),
    discount: Joi.number().positive(),
    descriptions: Joi.string(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH'),
    transactionDate: Joi.date(),
    status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED'),
    receiptUrl: Joi.string(),
  },
});

module.exports = {
  FindByIdOrDeletePaymentSchema,
  FindAllPaymentsSchema,
  CreatePaymentSchema,
  UpdatePaymentSchema,
};