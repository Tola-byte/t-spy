const { Pool, Client } = require("pg");
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
// db.query("DROP TABLE IF EXISTS AUTHENTICATED_USERS")
//   .then((result) => resultHandler(result, "Table was dropped"))
//   .catch((err) => errHandler(err));

db.query(
  `CREATE TABLE IF NOT EXISTS AUTHENTICATED_USERS(
      ID SERIAL PRIMARY KEY NOT NULL,
      twitter_id bigint NOT NULL UNIQUE,
      twitter_id_str TEXT NOT NULL UNIQUE,
      twitter_screen_name CHAR(30) NOT NULL UNIQUE,
      twitter_followers_count INT NOT NULL,
      twitter_friends_count INT NOT NULL,
      twitter_favourites_count INT NOT NULL,
      twitter_statuses_count INT NOT NULL,
      twitter_token TEXT NOT NULL,
      twitter_tokenSecret TEXT NOT NULL,
      user_difference TEXT[] DEFAULT '{}',
      white_listed_users TEXT[] DEFAULT '{}',
      created_date TEXT NOT NULL)`
)
  .then((result) => resultHandler(result, "Table was created"))
  .catch((err) => errHandler(err));

// const create_table = (table_name, ) => {};
// const drop_table = () => {};
const add_user = async (_table_name, _values) => {
  const id = _values.id;
  const id_str = _values.id_str;
  const screen_name = _values.screen_name;
  const followers_count = _values.followers_count;
  const friends_count = _values.friends_count;
  const favourites_count = _values.favourites_count;
  const statuses_count = _values.statuses_count;
  const token = _values.token;
  const tokenSecret = _values.tokenSecret;

  const add_user_sql = {
    text: `INSERT INTO ${_table_name} (
    twitter_id,
    twitter_id_str,
    twitter_screen_name,
    twitter_followers_count,
    twitter_friends_count,
    twitter_favourites_count,
    twitter_statuses_count,
    twitter_token,
    twitter_tokenSecret,
    created_date)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    values: [
      id,
      id_str,
      screen_name,
      followers_count,
      friends_count,
      favourites_count,
      statuses_count,
      token,
      tokenSecret,
      new Date().getTime(),
    ],
  };
  db.query(add_user_sql)
    .then((result) => resultHandler(result, "New user added"))
    .catch((err) => {
      errHandler(err);
      if (err.code == 23505) {
        update_tokes(_table_name, id, token, tokenSecret);
      }
    });
};
//update tokens
const update_tokes = (tn, id, tk, tks) => {
  const update_tokes_sql = {
    text: `UPDATE ${tn} SET twitter_token=$1, twitter_tokenSecret=$2 WHERE twitter_id=$3`,
    values: [tk, tks,id],
  };

  db.query(update_tokes_sql)
    .then((result) => resultHandler(result, "tokens updated"))
    .catch((err) => errHandler(err));
};

//const update a field
const update_field = async (tn, id, fn, val, wfn) => {
  const update_field_sql = {
    text: `UPDATE ${tn} SET ${fn}=$1 WHERE ${wfn}=$2`,
    values: [val, id],
  };

  await db
    .query(update_field_sql)
    .then((result) => resultHandler(result, "field updated"))
    .catch((err) => errHandler(err));
};

//get a field from db
const get_field = async (tn, id, fn, wfn) => {
  const get_field_sql = {
    text: `SELECT ${fn} FROM ${tn} WHERE ${wfn}=$1`,
    values: [id],
  };
  return await db
    .query(get_field_sql)
    .then((result) => {
      resultHandler(result, "field selected");
      return result.rows[0];
    })
    .catch((err) => errHandler(err));
};

module.exports = { add_user, update_field, get_field };

//success and failure handlers
const errHandler = (err) => {
  console.log(`code: ${err.code} stack: ${err.stack}}`);
};
const resultHandler = (result, message) => {
  // console.log({result})
  console.log(
    `${message}- command: ${result.command} - fields affected: ${result.fields.length} - rows affected: ${result.rows.length}`
  );
};
