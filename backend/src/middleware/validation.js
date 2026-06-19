const Joi = require('joi');

// Validation schema for creating a booking
const createBookingSchema = Joi.object({
  studentName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Student name is required',
    'string.min': 'Student name must be at least 2 characters',
    'string.max': 'Student name must not exceed 100 characters'
  }),
  studentEmail: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  studentPhone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  subject: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Subject is required',
    'string.min': 'Subject must be at least 2 characters',
    'string.max': 'Subject must not exceed 200 characters'
  }),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes must not exceed 1000 characters'
  }),
  slotId: Joi.string().uuid().required().messages({
    'string.empty': 'Time slot is required',
    'string.guid': 'Invalid time slot ID'
  })
});

// Validation schema for availability query
const getAvailabilitySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional()
});

const validateBooking = (req, res, next) => {
  const { error } = createBookingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details[0].message
    });
  }
  next();
};

const validateAvailabilityQuery = (req, res, next) => {
  const { error } = getAvailabilitySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateBooking,
  validateAvailabilityQuery
};