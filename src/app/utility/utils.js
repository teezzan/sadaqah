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
exports.generateResetJWT = (user) => {

    return jwt.sign({
        id: user.id,
        googleId: user.googleId,
        exp: Math.floor((Date.now() / 1000) + (60 * 30))
    }, env.PASSWORD_RESET_JWT_SECRET);
};

exports.resolveToken = async ({ token }) => {
    console.log(token)
    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
                console.log(err);
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

exports.resolveResetToken = async ({ token }) => {
    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, env.PASSWORD_RESET_JWT_SECRET, (err, decoded) => {
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
exports.composePassMail = (payload) => {

    let mailbody = ` <p> Hello ${payload.name},</p>
    <p>You have requested to change your password on Sadaqah. We sent this mail to confirm that you initiated the process. To continue click the button below.
    </p>
    <a href="${payload.url}"><button>Reset Password</button></a>
    <p> If you did not request this, please ignore. Thank You
    </p>
    <p>Taiwo
    </p>`;
    return mailbody
}

exports.Authenticate = async (req, res, next) => {
    let { authorization } = req.headers;
    if (authorization) {
        let token = authorization.split(' ')[1]
        let user = await this.resolveToken({ token });
        if (user) {
            req.ctx = { user, auth: true }
        }
        else {
            req.ctx = { auth: false }
        }
    }
    else {
        req.ctx = { auth: false }
    }
    console.log(req.ctx);
    next()
}

exports.Authorize = async (req, res, next) => {

    if (req.ctx.auth == false) {
        res.status(401).json({ message: "UnAuthorized" })
        return
    }
    console.log("Authorized as ", req.ctx.user.email);
    next()
}