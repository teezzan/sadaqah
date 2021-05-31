const Joi = require('joi');
let User = require("../model/User");
let bcrypt = require('bcryptjs');
let schemas = require('../model/schema');
let { publify, generateJWT, generateResetJWT, resolveResetToken, resolveToken, composePassMail } = require("../utility/utils");
let public_fields = ["id", "name", "email", "avatar", "contributions"];



exports.registerOrLoginWithGoogle = async (payload) => {
    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.googleAccountCreation.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { googleId } = payload;
        User.findOne({ googleId }).then(async (user) => {
            if (!user) {
                User.create(payload).then(async (new_user) => {
                    return resolve({ user: await publify(new_user, public_fields), token: generateJWT(new_user) })
                })
            }
            else {
                return resolve({ user: await publify(user, public_fields), token: generateJWT(user) })
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
                User.create({ email, password: bcrypt.hashSync(password, 10), name }).then(async (new_user) => {
                    return resolve({ user: await publify(new_user, public_fields), token: generateJWT(new_user) })
                })
            }
            else {
                reject({ status: 'error', message: "User Exists", code: 422 });
            }
        }).catch((error) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });
    })
}

exports.login = async (payload) => {

    return new Promise(async (resolve, reject) => {
        const { error } = schemas.user.login.validate(payload);

        if (error !== undefined)
            return reject({ status: 'error', message: error.message, code: 422 });

        let { email, password } = payload;
        User.findOne({ email }).then(async (user) => {
            if (!user)
                return reject({ status: 'error', message: "User Does not Exist", code: 401 });

            else {
                const pass_auth = await bcrypt.compare(password, user.password);
                if (!pass_auth)
                    return reject({ status: 'error', message: "Wrong Password", code: 401 });
                return resolve({ user: await publify(found, public_fields), token: generateJWT(found) });
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
        User.findOne({ email }).then((user) => {
            if (user && user.id !== ctx.user.id)
                return reject({ status: 'error', message: "Email Already Registered", code: 422 });
            if (password)
                payload.password = bcrypt.hashSync(password, 10);

            User.findByIdAndUpdate(ctx.user.id, payload, { new: true }).then(async (new_user) => {
                resolve({ user: await publify(new_user, public_fields) })
            })

        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}

exports.me = async (ctx) => {
    return new Promise(async (resolve, reject) => {

        User.findOne({ $or: [{ _id: ctx.user.id }, { googleId: ctx.user.googleId }] }).then(async (user) => {

            if (!user)
                return reject({ status: 'error', message: "Not Found", code: 404 });
            resolve({ user: await publify(user, public_fields) })
        }).catch((err) => {
            return reject({ status: 'error', message: err.message, code: 500 })
        });

    })
}