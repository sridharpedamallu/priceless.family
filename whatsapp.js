const twilio = require('twilio');

exports.whatsapp = async (
    toName, toNumber, fromName, link
) => {
    
  let accountSid = 'AC96efb3986d563c6831516825be159652'; // Your Account SID from www.twilio.com/console
  let authToken = 'c961b43c9c5eee10362f244db5590b42';   // Your Auth Token from www.twilio.com/console

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