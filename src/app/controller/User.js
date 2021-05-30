const Joi = require('joi');
let User = require("../model/User");

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
