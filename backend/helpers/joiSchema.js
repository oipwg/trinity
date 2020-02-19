const Joi = require('@hapi/joi');
// api documentation
// https://hapi.dev/family/joi/api/?v=17.1.0

const scehma = Joi.object().keys({
    userName: Joi.string().required(),
    email: Joi.any(),
    password: Joi.string().required(),
});

module.exports = scehma;
