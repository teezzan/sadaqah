const Joi = require('joi');
let User = require("../model/User");
let axios = require('axios');
let bcrypt = require('bcryptjs');
let schemas = require('../model/schema');
let { publify, generateJWT, generateResetJWT, resolveResetToken, resolveCardToken, composePassMail } = require("../utility/utils");
let public_fields = ["id", "name", "email", "avatar", "contributions", "subscriptions", "account_number",
    "bank_name", "account_name"];
let Card = require("../model/Cards");
let env = require('../config/env')
let PaymentController = require('./Payment');



exports.registerOrLoginWithGoogle = async (payload) => {
    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.googleAccountCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { googleId } = payload;
        User.findOne({ googleId }).then(async (user) => {
            if (!user) {
                User.create(payload).then(async (new_user) => {
                    return resolve({ user: await publify(new_user, ["id", "name", "email", "avatar"]), token: generateJWT(new_user) })
                })
            }
            else {
                User.findByIdAndUpdate(user.id, payload, { new: true }).then(async (new_user) => {
                    return resolve({ user: await publify(new_user, ["id", "name", "email", "avatar"]), token: generateJWT(new_user) })
                })
            }
        }).catch((error) => {
            return reject({ status: 'error', message: error.message, code: 422 });
        })


    })
}

exports.create = async (payload) => {

    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.accountCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { email, password, name } = payload;
        User.findOne({ email }).then(async (user) => {
            if (!user) {
                User.create({ email, password: bcrypt.hashSync(password, 10), name, googleId: `${Math.random() * 100}+${name}` }).then(async (new_user) => {
                    return resolve({ user: await publify(new_user, public_fields), token: generateJWT(new_user) })
                })
            }
            else {
                reject({ status: 'error', message: "User Exists", code: 422 });
            }
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });
    })
}

exports.login = async (payload) => {

    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.authentication.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { email, password } = payload;
        User.findOne({ email }).then(async (user) => {
            if (!user)
                return reject({ status: 'error', message: "User Does not Exist", code: 401 });
            else if (user.password == undefined) {
                return reject({ status: 'error', message: "Please Set your password", code: 422 })
            }
            else {
                const pass_auth = await bcrypt.compare(password, user.password);
                if (!pass_auth)
                    return reject({ status: 'error', message: "Wrong Password", code: 401 });
                return resolve({ user: await publify(user, ["id", "name", "email", "avatar"]), token: generateJWT(user) });
            }
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });
    })
}

exports.forgetPassword = async (payload) => {

    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.passwordRetrieval.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { email } = payload;
        User.findOne({ email }).then(async (user) => {
            if (!user)
                return reject({ status: 'error', message: "User Does not Exist", code: 401 });
            let cipher = generateResetJWT(user);

            let mail = { url: `${env.server}/verifypass/?token=${cipher}`, name: user.name }
            let html = composePassMail(mail);
            let msg = {
                to: `${user.email}`,
                from: '"Hassan" <noreply@Sadaqah.com>',
                subject: 'Reset Your Password',
                text: '...',
                html
            };

            //send mail
            return resolve({ msg })

        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });


    })
}

exports.greet = async (ctx) => {
    return new Promise(async (resolve, reject) => {
        try {
            return resolve({ status: "Hello World!!!" })

        }
        catch (err) {
            return reject({ status: "error", message: "Internal Server Error", code: 500 })
        }

    })
}

exports.verifyPasswordToken = async (token) => {

    return new Promise(async (resolve, reject) => {
        let payload = await resolveResetToken(token);
        if (!payload)
            return reject({ status: 'error', message: "UnAuthorized", code: 401 });
        let { id } = payload;

        User.findOne({ _id: id }).then((user) => {
            if (!user)
                return reject({ status: 'error', message: "User Does not Exist", code: 401 });
            return resolve({ status: true })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });


    })
}

exports.changePassword = async ({ token, password }) => {

    return new Promise(async (resolve, reject) => {
        let payload = await resolveResetToken(token);
        if (!payload)
            return reject({ status: 'error', message: "UnAuthorized", code: 401 });
        let { id } = payload;

        User.findOne({ _id: id }).then((user) => {
            if (!user)
                return reject({ status: 'error', message: "User Does not Exist", code: 401 });
            User.updateOne({ _id: id }, {
                password: bcrypt.hashSync(password, 10)
            }).then(() => {
                return resolve({ status: "success" })
            })

        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.editUser = async (ctx, payload) => {
    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.accountEdit.validate(payload);
        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { email, password } = payload;
        if (email) {
            User.findOne({ email }).then((user) => {
                if (user && user.id !== ctx.user.id)
                    return reject({ status: 'error', message: "Email Already Registered", code: 422 });
            }).catch((err) => {
                return reject({ status: 'error', message: err.message, code: 500 })
            });
        }
        if (password)
            payload.password = bcrypt.hashSync(password, 10);


        User.findByIdAndUpdate(ctx.user.id, payload, { new: true }).then(async (new_user) => {
            resolve({ user: await publify(new_user, public_fields) })
        })

    })
}

exports.me = async (ctx) => {
    return new Promise(async (resolve, reject) => {

        User.findOne({ $or: [{ _id: ctx.user.id }, { googleId: ctx.user.googleId }] }).then(async (user) => {

            if (!user)
                return reject({ status: 'error', message: "Not Found", code: 404 });

            Card.find({ user: user.id }).then(async (cards) => {
                let dec_cards;
                if (cards.length != 0) {


                    const getSubscriptionData = async () => {
                        return Promise.all(
                            cards.map(async (card) => {
                                try {
                                    let authorization = await resolveCardToken({ token: card.card_token });
                                    card.details = await publify(authorization, ["card_type", "bank", "brand", "last4"]);
                                    let res = await publify(card, ["next_bill_date", "campaign_title", "details", "payment_type"]);
                                    console.log(res);

                                    return res;
                                }
                                catch (err) {
                                    console.log(err)
                                    return null;
                                }

                            })
                        )
                    }

                    getSubscriptionData().then(async (subscriptions) => {
                        user.subscriptions = subscriptions;
                        resolve({ user: await publify(user, public_fields) })

                    })

                }
                else {
                    user.subscriptions = [];
                    resolve({ user: await publify(user, public_fields) })
                }


            })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}


exports.addAccountNumber = async (ctx, payload) => {
    return new Promise(async (resolve, reject) => {
        PaymentController.getAccountDetails(payload)
            .then(async (data) => {

                const ps_payload = {
                    type: "nuban",
                    name: String(ctx.user.id),
                    account_number: payload.account_number,
                    bank_code: payload.bank_code,
                    currency: "NGN",
                    test: "shitty"
                }
                console.log(ps_payload);
                axios.post(
                    "https://api.paystack.co/transferrecipient",
                    ps_payload,
                    {
                        headers: {
                            authorization: `Bearer ${env.paystack_private_key}`,
                            "Content-Type":
                                "application/json",
                        },
                    }
                ).then((rs) => {
                    let userdata = rs.data;
                    User.findByIdAndUpdate(ctx.user.id, {
                        account_number: userdata.data.details.account_number,
                        account_name: userdata.data.details.account_name,
                        bank_code: userdata.data.details.bank_code,
                        bank_name: userdata.data.details.bank_name,
                        recipient_code: userdata.data.recipient_code
                    }, { new: true }).then(async (new_user) => {
                        resolve({ user: await publify(new_user, public_fields) })
                    })
                }).catch((err) => {
                    return reject({ status: 'error', message: err.message, code: 500 });
                })
            }).catch((err) => {
                return reject({ status: 'error', message: err.message, code: 500 });
            })



    })
}

