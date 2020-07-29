var express = require("express");
var session = require("express-session");
var app = express();
var Passport = require("./connect").Passport();
const {
  index,
  twitter_accept,
  not_login,
  white_listed,
  add_to_white_list,
  remove_from_white_list,
  logout,
  unfollow,
} = require("./views");
// express app.use
app.use(
  session({
    secret: "twitter_bot",
    resave: true,
    saveUninitialized: true,
    // cookie: { expires: 60 * 1000 * 90, maxAge: 60 * 1000 * 90 },
  })
);
app.use(Passport.initialize());
app.use(Passport.session());
app.set("view engine", "pug");
//index page
app.get("/", async (req, res) => await index(req, res));

//twitter authrntication page
app.get("/grantAccess", Passport.authenticate("twitter"));

//twitter redirect after authentication page
app.get(
  "/twitter/accept",
  Passport.authenticate("twitter", {
    failureRedirect: "/login",
    // successRedirect: "/tweeter/accept/process",
  }),
  (req, res) => twitter_accept(req, res)
);

//login page
app.get("/login", (req, res) => not_login(req, res));

//white list page
app.get("/white-list", (req, res) => white_listed(req, res));

//logout uer
app.get("/logout", (req, res) => logout(req, res));

//add user to white list
app.get("/white-list/add/:screen_name", (req, res) =>
  add_to_white_list(req, res)
);

//add user to white list
app.get("/white-list/remove/:screen_name", (req, res) =>
  remove_from_white_list(req, res)
);

//unfollow a user
app.get("/process/unfollow/:screen_name", (req, res) => unfollow(req, res));

//start node server server
var server = app.listen(process.env.PORT || 3000, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("visit http://%s:%s", host, port);
});
