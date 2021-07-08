const twilio = require('twilio');
const dotenv = require("dotenv");
dotenv.config();

exports.whatsapp = async (
    toName, toNumber, fromName, link
) => {
    
  let accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
  let authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

  let twilio = require('twilio');
  let client = new twilio(accountSid, authToken);

  const messageBody = `Hello ${toName}, You have a party invitation from ${fromName}. 
    visit this link to view more ${link}`

  await client.messages.create({
      body: messageBody,
      to: 'whatsapp:+917799293650',  // Text this number
      from: 'whatsapp:+14155238886' // From a valid Twilio number
  })
    .then((message) => console.log(message.sid, messageBody));
}