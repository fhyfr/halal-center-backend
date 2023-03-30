const Joi = require('joi');

const FindByIdOrDeletePaymentSchema = Joi.object({
  id: Joi.number().positive().positive(),
});

const FindAllPaymentsSchema = Joi.object({
  page: Joi.number().positive(),
  size: Joi.number().positive(),
  userId: Joi.number().positive(),
  courseId: Joi.number().positive(),
  type: Joi.string().valid('registration', 'course_utilities'),
});

const CreatePaymentSchema = Joi.object({
  courseId: Joi.number().positive().required(),
  userId: Joi.number().positive(),
  amount: Joi.number().positive().allow(0).required(),
  discount: Joi.number().positive().allow(0).required(),
  descriptions: Joi.string().required(),
  type: Joi.string().valid('REGISTRATION', 'COURSE_UTILITIES').required(),
  paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CASH').required(),
  transactionDate: Joi.date().required(),
  status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED').required(),
  receiptUrl: Joi.string().required(),
});

const UpdatePaymentSchema = Joi.object({
  params: {
    id: Joi.number().positive(),
  },
  body: {
    courseId: Joi.number().positive(),
    userId: Joi.number().positive(),
    amount: Joi.number().positive().allow(0),
    discount: Joi.number().positive().allow(0),
    descriptions: Joi.string(),
    type: Joi.string().valid('REGISTRATION', 'COURSE_UTILITIES'),
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
