const axios = require('axios');
let User = require("../model/User");
let Card = require("../model/Cards");
let Campaign = require("../model/Campaign");
let Record = require("../model/Record");
let schemas = require('../model/schema');
let crypto = require('crypto');
let env = require("../config/env");
let jwt = require('jsonwebtoken');
const { campaign } = require('../model/schema');
let paymentType = ["single", "weekly", "monthly"];

exports.generatePaymentLink = async (ctx, payload) => {

    return new Promise(async (resolve, reject) => {

        payload.amount = Number(payload.amount)
        if (payload.amount < 0) {
            return reject({
                status: "error", message: "Payment Error", code: 422
            });
        }

        const { error } = schemas.payment.paymentCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { campaign } = payload;
        Campaign.findById(campaign).then(async (campaign) => {
            if (!campaign)
                return reject({ status: 'error', message: "Not Found", code: 404 });
            let ps_payload = {
                amount: payload.amount * 100,
                currency: "NGN",
            };
            let metadata = {
                campaign: campaign.id,
                campaign_title: campaign.title

            }
            if (ctx.user) {
                let user = await User.findById(ctx.user.id);
                if (user.email) {
                    ps_payload.email = user.email;
                } else {
                    ps_payload.email = "*************@gmail.com";
                }
                metadata.user = ctx.user.id;
                metadata.paymentType = paymentType[payload.type];
                // ps_payload.reference = `${campaign.id}==${ctx.user.id}==${Date.now()}`;
            } else {
                metadata.user = null;
                ps_payload.email = "*************@gmail.com";
                ps_payload.reference = `${campaign.id}==null==${Date.now()}`;
                metadata.paymentType = paymentType[0];
            }
            console.log(ps_payload);
            ps_payload.metadata = metadata;
            let res = await axios.post(
                "https://api.paystack.co/transaction/initialize",
                ps_payload,
                {
                    headers: {
                        authorization: `Bearer ${env.paystack_private_key}`,
                        "Content-Type":
                            "application/json",
                    },
                }
            );
            if (res.data.status) {
                let data = res.data.data;
                return resolve({
                    status: "success",
                    authorization_url: data.authorization_url
                });
            } else {
                return reject({
                    status: "error", message: "Payment Error", code: 500
                });
            }


        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });


    })
}

exports.hook = async (req) => {
    return new Promise(async (resolve, reject) => {
        if (req.headers["x-paystack-signature"]) {
            var hash = crypto
                .createHmac(
                    "sha512",
                    env.paystack_public_key
                )
                .update(JSON.stringify(req.body))
                .digest("hex");

            let { data, event } = req.body;
            if (hash !== req.headers["x-paystack-signature"] || event !== "charge.success")
                resolve({ status: 'error', message: "Nice Try", code: 401 })

            let reference = data.reference;
            // let campaignID = reference.split("==")[0];
            // let user = reference.split("==")[1];

            let user = data.metadata.user;
            let campaignID = data.metadata.campaign;
            let campaign_title = data.metadata.campaign_title;

            Record.find({ campaign: campaignID }).sort([['createdAt', -1]]).limit(1).then((record) => {
                record = record[0];
                let contributions = {
                    amount: data.amount / 100,
                    date: new Date(),
                    total_before: record.total,
                    total_after: record.total + (data.amount / 100)
                }
                if (user !== null) {
                    contributions.user = user;
                }
                console.log(contributions)
                Record.findByIdAndUpdate(record.id, {
                    $push: {
                        contributions
                    },
                    $set: {
                        total: contributions.total_after
                    }
                }, { new: true }).then(async (new_record) => {

                    if (user !== null) {
                        contributions.record = new_record.id;
                        contributions.campaign = new_record.campaign;
                        let u = await User.findByIdAndUpdate(user, {
                            $push: {
                                contributions
                            },
                            $set: {
                                total: contributions.total_after
                            }
                        }, { new: true });

                        const today = new Date();
                        const exp = new Date(today);
                        exp.setDate(today.getDate() + 7);

                        let card_token = jwt.sign(data.authorization, env.CARD_JWT_SECRET);
                        if (data.metadata.paymentType !== "single") {
                            let c = await Card.create({
                                email: data.customer.email,
                                next_bill_date: exp,
                                card_token,
                                user: u.id,
                                campaign_title,
                                payment_type: data.metadata.paymentType
                            })
                        }


                    }
                    resolve({ status: "Success" });

                }).catch((err) => {
                    console.log(err)
                    return reject({ status: 'error', message: err.message, code: 500 })
                });
            }).catch((err) => {
                return reject({ status: 'error', message: err.message, code: 500 })
            });
        }

        return reject({ status: 200 });

    })
}