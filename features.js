var Twit = require("./connect").Twit;
const {
  get_ids,
  get_diffrence_ids,
  get_details,
  follow_unfollow_user,
} = require("./features/friends_followers");
const { get_tweet } = require("./features/tweets_mentions");
let myCurrentUser;

//get details and send DM
const filter_search = async (_req, user_id, followers_count, friends_count) => {
  myCurrentUser = user_id;
  let followers = await get_ids(
    Twit(_req),
    "followers/ids",
    user_id,
    followers_count
  );
  let friends = await get_ids(
    Twit(_req),
    "friends/ids",
    user_id,
    friends_count
  );
  let diffrence = await get_diffrence_ids(friends, followers);
  // console.log({ diffrence });
  await get_details(Twit(_req), myCurrentUser, diffrence);
};

const fetch_tweets = async (_req) => {
  const timeline = await get_tweet(_req, Twit, "statuses/home_timeline");
  const mentions = await get_tweet(_req, Twit, "statuses/mentions_timeline");
  return { timeline, mentions };
};

const call_unfollow_follow = async (_req, method, screen_name) => {
  await follow_unfollow_user(_req, Twit, method, screen_name);
};
module.exports = { filter_search, fetch_tweets, call_unfollow_follow };
