const Joi = require('joi');
const mongoose = require("mongoose");
let User = require("../model/User");
let Campaign = require("../model/Campaign");
let Record = require("../model/Record");
let schemas = require('../model/schema');
let { publify, generateJWT } = require("../utility/utils");
let public_fields = ["id", "title", "description", "assets", "creator", "target", "duration", "recurring", "record"];


exports.create = async (ctx, payload) => {
    console.log(payload)
    return new Promise(async (resolve, reject) => {
        const { error } = schemas.campaign.campaignCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { title, description, recurring, duration, assets, target } = payload;
        Campaign.create({
            title,
            description,
            duration,
            target,
            assets,
            recurring,
            creator: ctx.user.id,
            createdAt: new Date()
        }).then((campaign) => {
            Record.create({
                campaign: campaign.id,
                deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * duration),
                createdAt: new Date()
            }).then(async () => {
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

        Campaign.findOne({ _id }).then((campaign) => {
            if (!campaign)
                return reject({ status: 'error', message: "Not Found", code: 404 });
            Record.findOne({ campaign: campaign.id }).sort([['createdAt', -1]]).limit(1).then(async (record) => {

                campaign.record = record;
                return resolve({ campaign: await publify(campaign, public_fields) })
            })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.getAllCampaigns = async () => {

    return new Promise(async (resolve, reject) => {
        Campaign.find({}).sort([['total', -1]]).then((campaigns) => {
            return resolve({ campaigns })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.deleteCampaign = async (ctx, _id) => {

    return new Promise(async (resolve, reject) => {
        Campaign.findOneAndDelete({ creator: ctx.user.id, _id }).then((campaign) => {
            if (!campaign)
                return reject({ status: 'error', message: "Not Found", code: 404 });
            Record.findOneAndDelete({ campaign: _id }).then((record) => {
                return resolve({ status: "Success" });
            })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.editCampaign = async (ctx, payload) => {
    return new Promise(async (resolve, reject) => {

        console.log(payload)
        const { error } = schemas.campaign.campaignEdit.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { id } = payload;

        Campaign.findByIdAndUpdate(id, payload, { new: true }).then(async (campaign) => {
            if (!campaign)
                return reject({ status: 'error', message: "Not Found", code: 404 });
            resolve({ campaign: await publify(campaign, public_fields) });
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.getAllRecords = async (campaign) => {
    console.log(campaign)
    return new Promise(async (resolve, reject) => {
        Record.find({ campaign }).sort([['createdAt', -1]]).then((records) => {
            return resolve({ records })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.getLatestRecord = async (campaign) => {

    return new Promise(async (resolve, reject) => {
        Record.find({ campaign }).sort([['createdAt', -1]]).limit(1).then((record) => {
            return resolve({ record })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.createNewRecord = async (payload) => {

    return new Promise(async (resolve, reject) => {
        const { error } = schemas.record.recordCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { campaign, duration } = payload;

        Record.create({
            campaign,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * duration),
            createdAt: new Date()
        }).then(() => {
            return resolve({ status: "Success" });
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 });
        });


    })
}

exports.getDueRecords = async () => {

    return new Promise(async (resolve, reject) => {
        Record.find({
            deadline: { $lte: new Date() },
            createdAt: { $lte: new Date(Date.now() - 1000 * 60 * 60 * 12), }
        }).then((dueRecords) => {
            return dueRecords;
        }).then((due) => {
            if (due.length == 0)
                return resolve(true);
            let toCreate = [];
            let idArray = due.map(record => record.campaign);
            Campaign.find({ _id: { $in: idArray } }).then((campaigns) => {
                console.log(campaigns)
                for (const campaign of campaigns) {

                    if (campaign.recurring) {
                        toCreate.push({
                            campaign: mongoose.Types.ObjectId(campaign.id),
                            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * campaign.duration),
                            createdAt: new Date()
                        });
                    }


                }
                if (toCreate.length == 0)
                    return resolve(due)
                Record.collection.insertMany(toCreate).then((result) => {
                    console.log(result)
                    resolve(due);
                })

            })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 });
        });


    })
}


