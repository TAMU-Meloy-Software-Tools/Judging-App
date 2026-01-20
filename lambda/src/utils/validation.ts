import Joi from 'joi';
import { BadRequestError } from './errors';

/**
 * Validation schemas for API requests
 */

export const eventSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  eventType: Joi.string().valid('aggies-invent', 'problems-worth-solving').required(),
  duration: Joi.string().max(100).optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  location: Joi.string().max(255).required(),
  description: Joi.string().optional(),
  sponsor: Joi.object({
    name: Joi.string().required(),
    logoUrl: Joi.string().uri().optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
    secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
    textColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  }).optional(),
});

export const teamSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  name: Joi.string().min(1).max(255).required(),
  projectTitle: Joi.string().max(255).optional(),
  description: Joi.string().optional(),
  presentationOrder: Joi.number().integer().min(1).required(),
  members: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().optional(),
      })
    )
    .min(1)
    .required(),
});

export const scoreSubmissionSchema = Joi.object({
  teamId: Joi.string().uuid().required(),
  eventId: Joi.string().uuid().required(),
  scores: Joi.array()
    .items(
      Joi.object({
        rubricCriteriaId: Joi.string().uuid().required(),
        score: Joi.number().integer().min(0).max(25).required(),
        reflection: Joi.string().optional().allow(''),
      })
    )
    .min(1)
    .required(),
  comments: Joi.string().optional().allow(''),
  isSubmitted: Joi.boolean().required(),
});

export function validate<T>(schema: Joi.ObjectSchema, data: any): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    throw new BadRequestError(`Validation error: ${details}`);
  }

  return value as T;
}
