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
        callbackURL: "http://localhost:8010/auth/google/callback"
    },
        function (accessToken, refreshToken, profile, done) {
            let payload = {
                googleId: profile.id,
                avatar: profile.photos[0].value,
                name: profile.name.givenName
            }
            UserController.registerOrLoginWithGoogle(payload).then((response) => {
                console.log(response)
                return done(null, response);
            }).catch((err) => {
                return done(err.message, err);
            })
            // User.findOrCreate({ googleId: profile.id }, function (err, user) {
            //     return done(err, user);
            // });
            // console.log('accessToken = ', accessToken);
            // console.log('refreshToken = ', refreshToken);
            // console.log('profile = ', profile);
            // done(null, { profile: profile._json });
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
