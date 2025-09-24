import Joi from 'joi';

export const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number().integer().min(1).optional(), // Boleh ada/tidak
  albumId: Joi.string().optional(), // Boleh ada/tidak
});