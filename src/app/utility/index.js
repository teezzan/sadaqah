let passport = require('passport');

let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let env = require('../config/env');
let UserController = require("../controller/User")

module.exports = function (app) {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.SERVER}/auth/google/callback`
    },
        function (accessToken, refreshToken, profile, done) {
            let payload = {
                googleId: profile.id,
                avatar: profile.photos[0].value,
                name: profile.name.givenName
            }
            UserController.registerOrLoginWithGoogle(payload).then((response) => {
                return done(null, response);
            }).catch((err) => {
                return done(err.message, err);
            })
        }
    ));

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/authfail' }),
        function (req, res) {
            res.status(200).json(req.user);
        });
}
