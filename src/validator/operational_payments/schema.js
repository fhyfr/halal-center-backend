const Joi = require('joi');

const FindByIdOrDeleteOperationalPaymentSchema = Joi.object({
  operationalPaymentId: Joi.string().required(),
});

const FindAllOperationalPaymentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  courseId: Joi.string(),
});

const CreateOperationalPaymentSchema = Joi.object({
  courseId: Joi.string().required(),
  amount: Joi.number().positive().allow(0).required(),
  discount: Joi.number().positive().allow(0).required(),
  descriptions: Joi.string().required(),
  paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH').required(),
  transactionDate: Joi.date().required(),
  status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED').required(),
  receiptUrl: Joi.string().required(),
});

const UpdateOperationalPaymentSchema = Joi.object({
  params: {
    operationalPaymentId: Joi.string().required(),
  },
  body: {
    courseId: Joi.string(),
    amount: Joi.number().positive().allow(0),
    discount: Joi.number().positive().allow(0),
    descriptions: Joi.string(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH'),
    transactionDate: Joi.date(),
    status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED'),
    receiptUrl: Joi.string(),
  },
});

module.exports = {
  FindByIdOrDeleteOperationalPaymentSchema,
  FindAllOperationalPaymentsSchema,
  CreateOperationalPaymentSchema,
  UpdateOperationalPaymentSchema,
};
