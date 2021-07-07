const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

exports.main = async (subject, message, email) => {
  const from = '"Priceless.family - Party" <no-reply@priceless.family>';
  let transporter;

  if (process.env.FRONTEND_URI === "http://localhost:4200") {
    transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "95fb84891e2819",
        pass: "ea6096f31b0f65",
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: 'apikey',
        pass: 'SG.ZWl4G16NQI-Q6O-WJoOmUw.JVI_j_h1aYFLZ9r7rhKkm1m_gNgfrmyeJmGjewzM_                                  Eg'
      },
    });
  }
  
  let info = await transporter.sendMail({
      from: from,
      to: email,
      bcc: "sridhar@adso.com",
      subject: subject,
      text: message,
      html: message,
    });

  console.log("Message sent to : %s " + email, info.messageId);
};
