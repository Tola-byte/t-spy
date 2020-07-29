var twit = require("twit");
const passport = require("passport");
var Strategy = require("passport-twitter").Strategy;

//Twit configuration
const Twit = (_req) => {
  return new twit({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token: _req.session.passport.user.token,
    access_token_secret: _req.session.passport.user.tokenSecret,
  });
};
//passport configuration
const Passport = () => {
  return passport.use(
    new Strategy(
      {
        consumerKey: process.env.consumer_key,
        consumerSecret: process.env.consumer_secret,
        callbackURL: process.env.twitterCallbackUrl,
      },
      (token, tokenSecret, profile, callback) => {
        profile.token = token;
        profile.tokenSecret = tokenSecret;
        callback(null, profile);
      }
    )
  );
};

//passprt serializeUser
Passport().serializeUser((user, callback) => {
  callback(null, user);
});

//passprt deserializeUser
Passport().deserializeUser((obj, callback) => {
  callback(null, obj);
});


module.exports = { Passport, Twit };
