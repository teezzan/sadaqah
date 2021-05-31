const axios = require('axios');
let User = require("../model/User");
let Campaign = require("../model/Campaign");
let Record = require("../model/Record");
let schemas = require('../model/schema');
let crypto = require('crypto');


exports.generatePaymentLink = async (ctx, payload) => {
    return new Promise(async (resolve, reject) => {

        const { error } = schemas.payment.paymentCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { id } = payload;

        Campaign.findOne({ _id: id }).then((campaign) => {
            if (!campaign)
                return reject({ status: 'error', message: "Not Found", code: 404 });
            let ps_payload = {
                amount: payload.amount * 100,
                currency: "NGN",
            };

            if (ctx.user) {
                ps_payload.email = ctx.user.email;
                ps_payload.reference = `${campaign.id}==${ctx.user.id}`;
            } else {
                ps_payload.email = "*************@gmail.com";
                ps_payload.reference = `${campaign.id}==null`;
            }

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
                    paystack_public_key
                )
                .update(JSON.stringify(req.body))
                .digest("hex");

            let { data, event } = req.body;
            if (hash !== req.headers["x-paystack-signature"] || event !== "charge.success")
                resolve({ status: 'error', message: "Nice Try", code: 401 })

            let reference = data.reference;
            let id = reference.split("==")[0];
            // let amount = data.amount / 100; //naira-centric
            let influence = await InfluenceModel.findByIdAndUpdate(id, { new: true }, {
                $set: {
                    payment_ref: reference
                }
            });

            try {
                await publishToQueue(task_queue, JSON.stringify(influence));
            }
            catch (err) {
                return reject({ status: 'error', message: err.message, code: 500 })
            }

            return resolve({ status: 200 });
        }


        return reject({ status: 200 });

    })
}