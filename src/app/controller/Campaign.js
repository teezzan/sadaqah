const Joi = require('joi');
let User = require("../model/User");
let Campaign = require("../model/Campaign");
let Record = require("../model/Record");
let schemas = require('../model/schema');
let { publify, generateJWT } = require("../utility/utils");
let public_fields = ["id", "title", "description", "assets", "creator", "target", "duration", "recurring", "record"];


exports.create = async (ctx, payload) => {

    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.accountCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { title, description, recurring, duration, assets } = payload;
        Campaign.create({
            title,
            description,
            duration,
            assets,
            recurring,
            creator: ctx.user.id,
            createdAt: new Date.now()
        }).then((campaign) => {
            Record.create({
                campaign: campaign.id,
                deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * duration),
                createdAt: new Date.now()
            }).then(() => {
                return resolve({ campaign: await publify(campaign, public_fields) })
            }).catch((err) => {
                Campaign.findOneAndDelete({ creator: ctx.user.id, _id: campaign.id }).then(() => {
                    return reject({ status: 'error', message: err.message, code: 500 });
                });
            });
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.getCampaign = async (ctx, _id) => {

    return new Promise(async (resolve, reject) => {

        Campaign.findOne({ user: ctx.user.id, _id }).then((campaign) => {
            Record.findOne({ campaign: campaign.id }).sort([['createdAt', -1]]).then((record) => {
                if (record.length !== 0) {
                    campaign.record = record[0];
                }
                return resolve({ campaign: await publify(campaign, public_fields) })
            })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.getAllCampaigns = async (ctx) => {

    return new Promise(async (resolve, reject) => {

        Campaign.find({}).sort([['total', -1]]).then((campaigns) => {
            return resolve({ campaigns })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}