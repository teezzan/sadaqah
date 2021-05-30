const Joi = require('joi');
let User = require("../model/User");
let bcrypt = require('bcryptjs');
let schemas = require('../model/schema');
let { publify, generateJWT } = require("../utility/utils");
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
