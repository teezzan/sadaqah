const axios = require('axios');
let User = require("../model/User");
let Campaign = require("../model/Campaign");
let Record = require("../model/Record");
let schemas = require('../model/schema');
let crypto = require('crypto');
let env = require("../config/env")


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

            if (ctx.user) {
                let user = await User.findById(ctx.user.id);
                ps_payload.email = user.email;
                ps_payload.reference = `${campaign.id}==${ctx.user.id}`;
            } else {
                ps_payload.email = "*************@gmail.com";
                ps_payload.reference = `${campaign.id}==null`;
            }
            console.log("tttrrr  ", env.paystack_private_key)

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
            return reject({ status: 'error', message: err, code: 500 })
        });


    })
}

exports.hook = async (req) => {
    return new Promise(async (resolve, reject) => {

        if (req.headers["x-paystack-signature"]) {
            var hash = crypto
                .createHmac(
                    "sha512",
                    paystack_public_key
                )
                .update(JSON.stringify(req.body))
                .digest("hex");

            let { data, event } = req.body;
            if (hash !== req.headers["x-paystack-signature"] || event !== "charge.success")
                resolve({ status: 'error', message: "Nice Try", code: 401 })

            let reference = data.reference;
            let campaignID = reference.split("==")[0];
            let user = reference.split("==")[1];


            Record.find({ campaign: campaignID }).sort([['createdAt', -1]]).limit(1).then((record) => {

                let contributions = {
                    amount: data.amount / 100,
                    date: new Date(),
                    total_before: record.total,
                    total_after: record.total + (data.amount / 100)
                }
                if (user !== "null") {
                    contributions.user = user;
                }

                Record.findByIdAndUpdate(id, {
                    $push: {
                        contributions
                    },
                    $set: {
                        total: contributions.total_after
                    }
                }, { new: true }).then(async (new_record) => {
                    if (user !== "null") {
                        contributions.record = new_record.id;
                        contributions.campaign = new_record.campaign;
                        await User.findByIdAndUpdate(id, {
                            $push: {
                                contributions
                            },
                            $set: {
                                total: contributions.total_after
                            }
                        }, { new: true });
                    }
                    resolve({ status: "Success" });

                }).catch((err) => {
                    return reject({ status: 'error', message: err.message, code: 500 })
                });
            }).catch((err) => {
                return reject({ status: 'error', message: err.message, code: 500 })
            });
        }


        return reject({ status: 200 });

    })
}