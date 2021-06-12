const Joi = require('joi');

module.exports = {
    user: {
        googleAccountCreation: Joi.object().keys({
            name: Joi.string().min(1).required(),
            googleId: Joi.string().min(1).required(),
            avatar: Joi.string().min(1).required(),
            email: Joi.string().email().optional(),

        }),
        accountCreation: Joi.object().keys({
            name: Joi.string().min(1).required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[\x20-\x7E]+$/).min(8).max(72).required()

        }),
        authentication: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^[\x20-\x7E]+$/).min(8).max(72).required()
        }),
        passwordRetrieval: Joi.object().keys({
            email: Joi.string().email().required()
        }),
        accountEdit: Joi.object().keys({
            name: Joi.string().min(1).optional(),
            email: Joi.string().email().optional(),
            password: Joi.string().regex(/^[\x20-\x7E]+$/).min(8).max(72).optional()
        }),
        accountAdding: Joi.object().keys({
            account_number: Joi.string().min(1).required(),
            bank_code: Joi.string().min(1).required(),
        }),

    },
    campaign: {
        campaignCreation: Joi.object().keys({
            title: Joi.string().min(1).required(),
            description: Joi.string().min(1).required(),
            duration: Joi.number().min(1).required(),
            recurring: Joi.boolean().required(),
            assets: Joi.array().items(Joi.string().min(1)).optional(),
            target: Joi.number().min(1).required()
        }),
        campaignEdit: Joi.object().keys({
            id: Joi.string().min(1).required(),
            title: Joi.string().min(1).optional(),
            target: Joi.number().min(1).optional(),
            description: Joi.string().min(1).optional(),
            duration: Joi.number().min(1).optional(),
            recurring: Joi.boolean().optional(),
            assets: Joi.array().items(Joi.string().min(1)).optional()
        }),

    },
    record: {
        recordCreation: Joi.object().keys({
            campaign: Joi.string().min(1).required(),
            duration: Joi.number().min(1).required(),
        })

    },
    payment: {
        paymentCreation: Joi.object().keys({
            campaign: Joi.string().min(1).required(),
            amount: Joi.number().min(1).required(),
            type: Joi.number().min(0).required()
        })
    }
}
