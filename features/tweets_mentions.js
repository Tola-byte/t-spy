//get tweets from user (timeline or mentions)
const get_tweet = async (_req,_Twit, method) => {
  return await _Twit(_req)
    .get(method, {
      tweet_mode: "extended",
      // exclude_replies: false,
      include_entities: true
    })
    .then((result) => result.data);
};

module.exports = { get_tweet };
