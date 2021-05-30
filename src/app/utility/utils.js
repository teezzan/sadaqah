let jwt = require('jsonwebtoken');
let _ = require('lodash');
let env = require("../config/env")


exports.generateJWT = (user) => {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 7);

    return jwt.sign({
        id: user.id,
        googleId: user.googleId,
        exp: Math.floor(exp.getTime() / 1000)
    }, env.JWT_SECRET);
};

exports.resolveToken = async ({ token }) => {
    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET, (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
            });
        });
        return decoded;
    }
    catch (err) {
        return null
    }

}

exports.publify = async (user, fields) => {
    return await _.pick(user, [...fields]);
}