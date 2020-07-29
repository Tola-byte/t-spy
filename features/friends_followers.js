const { send_DM } = require("./direct_message");
const { update_field, get_field } = require("../connections/db_connect");
const tn = "AUTHENTICATED_USERS";
//get followers and friends/following user ids
const get_ids = async (_Twit, link, user_id, count) => {
  //create parameter for getting ids
  const param = {
    user_id,
    skip_status: 1,
    count,
    cursor: -1,
  };

  //get ids
  let ids = await _Twit
    .get(link, param)
    .then((results) => results.data.ids)
    .then((data) => data)
    .catch((err) =>
      console.error("could not get followers Ids: ", err.message)
    );
  return ids;
};
//get diifrence between followers and friends
const get_diffrence_ids = async (friends_ids, followers_ids) => {
  let diffrence_ids_array = [];
  friends_ids.forEach((element) => {
    let userFollowered = followers_ids.includes(element);
    if (!userFollowered) {
      diffrence_ids_array.push(element.toString());
    }
  });
  return diffrence_ids_array;
};

//get details for diffrent ids
const get_details = async (_Twit, _myCurrentUser, ids) => {
  var details = [];
  let count = 0;
  //   itrate each user id
  ids.forEach(async (user_id) => {
    //get user's screen name
    let user = await _Twit
      .get("users/lookup", { user_id: user_id })
      // .get("users/show", { user_id: user_id })
      .then((results) => results.data)
      .then((data) => {
        count++;
        return data[0].screen_name;
      })
      .catch((_err) => {
        count++;
        console.error({ ERROR: _err.message, undefined_user: user_id });
      });
    if (user !== undefined) {
      details.push(`@${user}`);
    }
    if (count == ids.length) {
      await details_result(_Twit, _myCurrentUser, details);
      // returnDetails = [];
      //
    }
  });
};

//send subscribres a DM with userscreen name
const details_result = async (_Twit, _myCurrentUser, details) => {
  let send_name = [];
  await update_field(
    tn,
    _myCurrentUser,
    "user_difference",
    `{${details}}`,
    "twitter_id_str"
  );
  await get_field(
    tn,
    _myCurrentUser,
    "white_listed_users",
    "twitter_id_str"
  ).then((val) => {
    if (val.white_listed_users.length == 0) {
      send_DM(_Twit, _myCurrentUser, details.join(", "));
    } else {
      details.forEach((user) => {
        if (!val.white_listed_users.includes(user)) {
          send_name.push(user);
        }
      });

      send_DM(_Twit, _myCurrentUser, send_name.join(", "));
    }
  });
};
const follow_unfollow_user = async (_req, Twit, method, screen_name) => {
  await Twit(_req)
    .post(method, { screen_name: screen_name })
    .then((response) => console.log(response.data.screen_name))
    .catch((err) => console.log(err));
};
module.exports = {
  get_ids,
  get_diffrence_ids,
  get_details,
  follow_unfollow_user,
};
