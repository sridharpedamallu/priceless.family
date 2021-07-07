const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const cors = require("cors")

const invite_routes = require("./routes/invite.route")
const user_routes = require("./routes/user.route")
const party_routes = require("./routes/party.route")

dotenv.config()

const app = express()
app.use(cors())

const port = 3000

app.use(bodyParser.json({ type: "application/json" }))
mongoose.set('useFindAndModify', false)

mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      app.listen(port, () => {
        console.log("DB connected");
        console.log(`Server listening at ${port}`);
      });
    })
    .catch((error) => {
      console.log(error)
    })

app.use("/api/invites", invite_routes)
app.use("/api/users", user_routes)
app.use("/api/parties", party_routes)

app.get("/", (req, res) => {
    res.send('Current version 1.0')
})

// app.get("/wa", (req, res) => {

//   let accountSid = 'AC96efb3986d563c6831516825be159652'; // Your Account SID from www.twilio.com/console
//   let authToken = 'c961b43c9c5eee10362f244db5590b42';   // Your Auth Token from www.twilio.com/console

//   let twilio = require('twilio');
//   let client = new twilio(accountSid, authToken);

//   const messageBody = `Hello Sridhar, You have a party invitation from Anil Sunkara. 
//     visit this link to view more `

//   client.messages.create({
//       body: messageBody,
//       to: 'whatsapp:+917799293650',  // Text this number
//       from: 'whatsapp:+14155238886' // From a valid Twilio number
//   })
//     .then((message) => console.log(message.sid));
  
//   res.send('message sent');

// })
