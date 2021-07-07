const { encrypt, decrypt } = require("../crypto");
const dotenv = require("dotenv");
const User = require("../models/user.model");

const ForgotPassword = require("../models/forgotpassword.model");
const Loc = require("../models/location.model");

const sendEmail = require("../email");
const jwt = require("jsonwebtoken");

dotenv.config();

const pwdResetTimeoutMinutes = 3;

encrypt_password = (password) => {
  const encryptedPassword = encrypt(password);
  return encryptedPassword.iv + "_" + encryptedPassword.content;
};

compare_password = (password, encryptedPassword) => {
  const pwd = {
    iv: encryptedPassword.split("_")[0],
    content: encryptedPassword.split("_")[1],
  };
  return (decrypt(pwd) === password);
};

exports.signup = async (req, res) => {
  const encPwd = encrypt_password(req.body.password);

  const user = new User({
    fullname: req.body.fullname,
    email: req.body.email.toLowerCase(),
    phone: req.body.phone,
    password: encPwd,
  });

  await User.find({ email: req.body.email }).then((result) => {
    if (result.length) {
      return res.status(500).send({ error: "Email already exists" });
    } else {
      user.save().then((result) => {
        const subject = "Welcome to Priceless Family";
        const message = `
        <div style="font-family: verdana">
          <h3>Thanks for the registration</h3>
          <p>You are one step away to enjoy our services.
          To complete the registration please confirm your email by clicking the following</p>
    
          <a 
            style="color: white; background-color:#672be0;padding: 14px 25px;text-align: center;text-decoration: none;display: inline-block;"
            href="${process.env.FRONTEND_URI}/confirm-email/${result._id}">Confirm Email</a>
        </div>
        `;

        sendEmail.main(subject, message, req.body.email).catch(console.error);

        return res.json({ message: "User created successfully" });
      });
    }
  });
};

exports.confirm_email = async (req, res) => {
  await User.findById(req.params.id)
    .then((result) => {
      if (!result) {
        return res.status(404).send({ error: "User not found" });
      }

      if (result.emailconfirmed) {
        return res.status(401).send({ error: "Email aleady confirmed" });
      }

      result.emailconfirmed = true;
      result.save();

      return res.send({ message: "Email successfully confirmed" });
    })
    .catch(() => {
      return res.send("Unable to process request");
    });
};

exports.signIn = async (req, res) => {

  await User.findOne({
    email: req.body.email.toLowerCase()
  }).then((result) => {
    if (!result) {
      return res.status(401).send({ error: "Not authorised" });
    }
    
    if (!compare_password(req.body.password, result.password)) {
      return res.status(401).send({ error: "Not authorised" });
    }

    if (!result.emailconfirmed) {
      return res.status(401).send({ error: "Email not verified yet" });
    }

    let payload = { id: result._id, email: result.email };

    let accessToken = jwt.sign(
      {
        data: payload,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.send({
      message: "success",
      accessToken,
    });
  });
};

exports.getFriends = async (req, res) => {
  return await User.findById(req.user.data.id).then((result) => {
    return res.send(result.guests);
  });
};

exports.locationDetails = async (req, res) => {
  const postcode = req.params.postcode;

  await Loc.findOne({ zip: postcode }).then((result) => {
    if (result) {
      return res.send(result);
    } else {
      return res.send([]);
    }
  });
};

exports.forgotPassword = async (req, res) => {
  const email = req.params.email;

  await User.findOne({ email: email }).then(async (result) => {
    if (result) {
      const otp = Math.floor(100000 + Math.random() * 900000);

      await ForgotPassword.deleteMany({ email: result.email }, () => {});

      const fp = new ForgotPassword({
        user: result._id,
        email: result.email,
        otp,
      });

      fp.save();

      const emailMessage = `<h3>${otp}</h3>`;

      sendEmail
        .main("Forgot password", emailMessage, result.email)
        .catch(console.error);

      return res.send({
        message: "OTP Sent to email",
        timeoutMinutes: pwdResetTimeoutMinutes,
      });
    } else {
      return res.status(404).send({ error: "User not found" });
    }
  });
};

exports.validateOtp = async (req, res) => {
  otp = req.body.otp;
  email = req.body.email;

  await ForgotPassword.findOne({ email: email, otp: otp }).then((result) => {
    if (!result) {
      return res.status(404).send({ error: "Incorrect OTP" });
    }

    const expiryTime = new Date(
      new Date(result.createdAt).getTime() + pwdResetTimeoutMinutes * 60000
    );
    const cTime = new Date();

    if (expiryTime.getTime() < cTime.getTime()) {
      return res.status(500).send({ error: "OTP Expired" });
    }

    return res.send({ message: "OTP Validated Successfully!" });
  });
};

exports.resetPassword = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const otp = req.body.otp;

  await ForgotPassword.findOne({ email: email, otp: otp }).then(
    async (result) => {
      if (!result) {
        return res
          .status(404)
          .send({
            error: "Error while resetting password. please contact us.",
          });
      }

      await User.findOneAndUpdate(
        { email: email },
        { password: encrypt_password(password) },
        () => {
          ForgotPassword.findOneAndDelete({ email: email, otp: otp }, () => {});
          return res.send({ message: "Password updated successfully" });
        }
      );
    }
  );
};

exports.saveGuest = async (req, res) => {

  
  if (req.body._id === "") {
    const guest = {
      guestname: req.body.guestname,
      email: req.body.email,
      phone: req.body.phone,
      country_code: req.body.country_code,
      isd: req.body.isd
    };

    await User.findByIdAndUpdate(
      req.user.data.id,
      { $push: { guests: guest } },
      { new: true }
    ).then((result) => {
      // return res.send(result);
      return res.send({ message: "Guest added successfully" });
    });
  } else {
    await User.findById(req.user.data.id).then((result) => {
      const user = result;
      user.guests.map((g) => {
        if (g._id == req.body._id) {
          g.guestname = req.body.guestname;
          g.email = req.body.email;
          g.phone = req.body.phone;
          g.country_code = req.body.country_code;
          g.isd = req.body.isd;
        }
      });
      user.save();
      return res.send({ message: "Guest Updated" });
    });
  }
};

exports.deleteGuest = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user.data.id,
    { $pull: { guests: { _id: req.params.guest } } },
    { new: true }
  ).then((result) => {
    return res.send({ message: "Guest deleted successfully" });
  });
};
