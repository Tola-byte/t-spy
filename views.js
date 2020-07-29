var { add_user, get_field, update_field } = require("./connections/db_connect");
var { fetch_tweets, call_unfollow_follow } = require("./features");
const tn = "AUTHENTICATED_USERS";

const index = async (_req, _res) => {
  check_user(_req, _res);
  if (_req.session.passport) {
    // setInterval(async () => {
      await fetch_tweets(_req)
        .then((result) => {
          // console.log(result.mentions);
          _res.render("index", {
            timeline: result.timeline,
            mentions: result.mentions,
          });
        })
        .catch((err) => console.log(err));
    // }, 60000);
  }
};

//twitter/accept function
const twitter_accept = async (_req, _res) => {
  //get user's information for session
  const {
    id,
    id_str,
    screen_name,
    followers_count,
    friends_count,
    favourites_count,
    statuses_count,
  } = _req.session.passport.user._json;

  const user = {
    id,
    id_str,
    screen_name,
    followers_count,
    friends_count,
    favourites_count,
    statuses_count,
    token: _req.session.passport.user.token,
    tokenSecret: _req.session.passport.user.tokenSecret,
  };
  // add user to database
  await add_user(tn, user).then(async (_) => {
    //import the features file and trigger search
    var { filter_search } = require("./features");
    await filter_search(_req, id_str, followers_count, friends_count).then(() =>
      _res.redirect("/")
    );
  });
};

//not logged in homepage
const not_login = (_req, _res) => {
  // _res.re(`templates/not_login.html`);
  _res.sendFile(`${__dirname}/templates/not_login.html`);
};

// logout
const logout = (_req, _res) => {
  _req.logout();
  _res.redirect("/login");
};

//white liested page
const white_listed = async (_req, _res) => {
  check_user(_req, _res);

  if (_req.session.passport) {
    let get_diff = await get_field(
      tn,
      _req.session.passport.user._json.id,
      "user_difference",
      "twitter_id"
    );
    let get_white_l = await get_field(
      tn,
      _req.session.passport.user._json.id,
      "white_listed_users",
      "twitter_id"
    );
    let diff = get_diff.user_difference;
    let white_l = get_white_l.white_listed_users;
    _res.render(`white_listed`, {
      diff,
      white_l,
    });
  }
};

// add user to white list
const add_to_white_list = (_req, _res) => {
  check_user(_req, _res);
  if (_req.session.passport) {
    get_field(
      tn,
      _req.session.passport.user._json.id,
      "white_listed_users",
      "twitter_id"
    ).then((result) => {
      let val = [];
      console.log(result);
      if (result.white_listed_users.length != 0) {
        val.push(result.white_listed_users);
        val.push(_req.params.screen_name);
      } else {
        val.push(_req.params.screen_name);
      }
      update_field(
        tn,
        _req.session.passport.user._json.id,
        "white_listed_users",
        `{${val}}`,
        "twitter_id"
      ).then((_) => _res.redirect("/white-list"));
    });
  }
};

// remove a user from white list
const remove_from_white_list = (_req, _res) => {
  check_user(_req, _res);
  if (_req.session.passport) {
    get_field(
      tn,
      _req.session.passport.user._json.id,
      "white_listed_users",
      "twitter_id"
    ).then((result) => {
      let name_index = result.white_listed_users.indexOf(
        _req.params.screen_name
      );
      result.white_listed_users.splice(name_index, 1);
      let new_list = result.white_listed_users;
      update_field(
        tn,
        _req.session.passport.user._json.id,
        "white_listed_users",
        `{${new_list}}`,
        "twitter_id"
      ).then((_) => _res.redirect("/white-list"));
    });
  }
};
//unfollow user
// TODO - update white list and diffrece from the table

const unfollow = async (_req, _res) => {
  check_user(_req, _res);
  if (_req.session.passport) {
    await call_unfollow_follow(
      _req,
      "friendships/destroy",
      _req.params.screen_name
    )
      .then(async (_) => {
        //update white listed field
        await get_field(
          tn,
          _req.session.passport.user._json.id,
          "white_listed_users",
          "twitter_id"
        ).then(async (result) => {
          result = result.white_listed_users;
          if (result.includes(_req.params.screen_name)) {
            let name_index = result.indexOf(_req.params.screen_name);
            result.splice(name_index, 1);
            await update_field(
              tn,
              _req.session.passport.user._json.id,
              "white_listed_users",
              result,
              "twitter_id"
            )
              .then((result) => console.log({ result }))
              .catch((err) => console.log(err));
          }
        });

        //update difference field
        get_field(
          tn,
          _req.session.passport.user._json.id,
          "user_difference",
          "twitter_id"
        ).then((result) => {
          result = result.user_difference;
          if (result.includes(_req.params.screen_name)) {
            let name_index = result.indexOf(_req.params.screen_name);
            result.splice(name_index, 1);
            update_field(
              tn,
              _req.session.passport.user._json.id,
              "user_difference",
              result,
              "twitter_id"
            );
          }
        });
      })
      .then((_) => _res.redirect("/white-list"))
      .catch((err) => console.log({ err }));
  }
};
module.exports = {
  index,
  twitter_accept,
  not_login,
  logout,
  white_listed,
  add_to_white_list,
  remove_from_white_list,
  unfollow,
};

//check if user is in session
const check_user = (_req, _res) => {
  if (
    _req.session.passport == undefined ||
    _req.session.passport.user == undefined
  ) {
    _res.redirect("/login");
  }
};
