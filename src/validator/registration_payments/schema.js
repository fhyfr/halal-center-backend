const Joi = require('joi');

const FindByIdOrDeleteRegistrationPaymentSchema = Joi.object({
  id: Joi.number().positive(),
});

const FindAllRegistrationPaymentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  registrationId: Joi.number().positive(),
  courseId: Joi.number().positive(),
  userId: Joi.number().positive(),
});

const CreateRegistrationPaymentSchema = Joi.object({
  registrationId: Joi.number().positive(),
  amount: Joi.number().positive().allow(0).required(),
  discount: Joi.number().positive().allow(0).required(),
  descriptions: Joi.string().required(),
  paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH').required(),
  transactionDate: Joi.date().required(),
  status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED').required(),
  receiptUrl: Joi.string().required(),
});

const UpdateRegistrationPaymentSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
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
  FindByIdOrDeleteRegistrationPaymentSchema,
  FindAllRegistrationPaymentsSchema,
  CreateRegistrationPaymentSchema,
  UpdateRegistrationPaymentSchema,
};
