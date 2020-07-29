//sending Direct messages
const send_DM = (_Twit, user_id, message) => {
  //create direct message event data
  const event_data = {
    event: {
      type: "message_create",
      message_create: {
        message_data: { text: message },
        target: { recipient_id: user_id },
      },
    },
  };
  //post direct message to user
  _Twit
    .post("direct_messages/events/new", event_data)
    .then((result) => result.data)
    .then((data) => delete_DM(_Twit, data.event.id, 1000 * 120)) //1000*60*60*24
    .catch((err) => {
      console.error(`message sending failed - ${err.message}`);
      // Twit.post("statuses/update", { status: "Alhamdulilah", user_id: user_id })
      //   .then((result) => result.data)
      //   .then((data) => console.log(data))
      //   .catch((err) => console.error(err.message));
    });
};
// delete a sent DM
const delete_DM = (_Twit, message_id, timeout) => {
  console.log("message sent!!!");
  setTimeout(() => {
    _Twit
      .delete("direct_messages/events/destroy", { id: message_id })
      .then((result) => result.data)
      .then((data) => console.log(data))
      .catch((err) => console.log(err.message));
  }, timeout);
};
module.exports = { send_DM };
