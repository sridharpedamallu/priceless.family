
const { encrypt, decrypt } = require('../crypto')
const dotenv = require("dotenv")
const Invite = require('../models/invite.model')
const User = require('../models/user.model')

const linkifyHtml = require('linkifyjs/html')
const sendEmail = require('../email')
const whatsapp = require('../whatsapp')

dotenv.config();

exports.index = async (req, res) => {

  const user = req.user.data.id;

  await Invite.find({ 'user': user }, 'title createdAt')
    .then(result => {
      return res.send(result);
    })
}

exports.getInviteDetails = async (req, res) => {

  await Invite.findById(req.params.invite)
    .populate('user')
    .then(result => {
      return res.send(result);
    })
}

exports.deleteInvite = async (req, res) => {

  await Invite.findByIdAndDelete(req.params.invite)
    .then(result => {
      return res.json({ message: "Invite deleted successfully" });
    })
}


exports.getGuestDetails = async (req, res) => {
  const hash = {
    iv: req.body.iv,
    content: req.body.content
  }
  
  const data = JSON.parse(decrypt(hash));

  await Invite.findById(data._id)
    .populate('user')
    .then((result) => {
    result.guests.map(guest => {
      if (guest.email === data.email) {
        const _guestPreviousChoices = (result.user.guests.filter(g => g.email === guest.email))[0].choices;
        const guestPreviousChoices = (_guestPreviousChoices.map(g => {return g.title})).reverse();

        guest = {
          guest,
          party: result.party,
          guestPreviousChoices
        }
        return res.json(guest);
      }
    })
  });

}

exports.getInviteByPartyId = async (req, res) => {

  await Invite.find({party: req.params.party})
      .then(result => {
        return res.send(result)
      })
}

exports.storeResponse = async (req, res) => {

  const hash = {
    iv: req.body.iv,
    content: req.body.content
  };
  const data = JSON.parse(decrypt(hash));

  await Invite.findById(data._id)
      .populate('user')
      .then((result) => {
    result.guests.map(async (guest, idx) => {
      if (guest.email === data.email) {
        
        let choiceList = ''
        req.body.guest.choices.map(choice => {
          choiceList += "  " + choice.title
        })

        const subject = "PartyHouse - Response to your invite";
        const message1 = `<div style="font-family:verdana"><p>There is a response for your invite from : ${guest.guestname}</p>`;
        const message2 = `<p>Phone : ${req.body.phone}</p>`;
        const message3 = `<p>Their choices are : ${choiceList}</p>`;
        const message4 = `<p>Their address is :</p>`;
        const message5 = `<p>${req.body.address_line1}</p><p>${req.body.address_line2}</p>`;
        const message6 = `<p>${req.body.city}</p><p>${req.body.postcode}</p></div>`;

        const message = message1.concat(message2, message3, message4, message5, message6);

        sendEmail.main(subject, message, result.user.email).catch(
          console.error
        );

        updguest = {
          guestname: guest.guestname,
          email: guest.email,
          phone: req.body.phone,
          choices: [...req.body.guest.choices],
          address_line1 : req.body.address_line1,
          address_line2 : req.body.address_line2,
          city : req.body.city,
          postcode : req.body.postcode,
          preference_setting: req.body.guest.preference_setting,
          rsvp_status: true
        }

        await Invite.findById(data._id)
          .then(async (data) => {
            
            data.guests[idx] = {...updguest };
        
            await data.save();
            if (req.body.guest.preference_setting === 1) {
              await User.findById(result.user._id).then(async (result1) => {
                result1.guests.map((guest, index) => {
                  result1.guests[index] = {
                    ...result1.guests[index].toObject(),
                    "address_line1" : req.body.address_line1,
                    "address_line2" : req.body.address_line2,
                    "city" : req.body.city,
                    "postcode" : req.body.postcode,
                  };
                  result1.save();
                  return res.send({'message': 'RSVP Success'});
                })
              })
              }
            if (req.body.guest.preference_setting === 2) {
              await User.findById(result.user._id).then(async (result1) => {
                result1.guests.map((guest, index) => {
                  if (guest.email === req.body.guest.email) {

                    let allChoices = result1.guests[index].choices;

                    if (req.body.guest.choices.length > 0) {
                      req.body.guest.choices.map(c => {
                        if (allChoices.filter(nChoice => nChoice.title === c.title).length === 0) {
                          allChoices.push({...c});
                        }
                      })
                    } else {
                      allChoices = req.body.guest.choices;
                    }

                    result1.guests[index] = {
                      ...result1.guests[index].toObject(),
                      "address_line1" : req.body.address_line1,
                      "address_line2" : req.body.address_line2,
                      "city" : req.body.city,
                      "postcode" : req.body.postcode,
                      "choices": [...allChoices]
                    };
                    result1.save();
                    return res.send({'message': 'RSVP Success'});
                  }
                });
              });
            } else {
              return res.send({ message : 'Rsvp confirmed!' });
            }
            
          });
      }
    })
  });
};

exports.store = async (req, res) => {

  const user = req.user.data.id;

  const invite = new Invite({
    user: user,
    title: req.body.title,
    party: req.body.party,
    partyDateTime: req.body.partyDateTime,
    invite_message: req.body.message,
    zoom_link: req.body.zoom_link,
    guests: [...req.body.guests],
  });

  let host

  await User.findById(user)
    .then(result => {
      host = result
    })

  invite.save().then((result) => {
    updateFriends(req.user.data.id, req.body.guests);

    req.body.guests.map((guest) => {

      const jsonObj = {
        'email': guest.email,
        '_id': result._id
      }

      const uniqueUrl = encrypt(JSON.stringify(jsonObj));

      const zoomLinkText = linkifyHtml(req.body.zoom_link, {
                            defaultProtocol: 'https'
                          });

      const emailLink = `${process.env.FRONTEND_URI}/rsvp/${uniqueUrl.iv}/${uniqueUrl.content}`

      const email_message = `<div style="font-family: verdana">${req.body.message}<br/><br/><br/>
      <br/><br/><br/>
      DateTime: ${req.body.partyDateTime}
      <br/><br/><br/>
      <p style="line-height: 1.6">${zoomLinkText}</p>
        <br/><br/><br/><br/><br/><br/>
         <a style="color: white; background-color:#f44336;padding: 14px 25px;text-align: center;text-decoration: none;display: inline-block;"
         href="${emailLink}">Click here to RSVP</a> </div>`;

      sendEmail.main(req.body.title, email_message, guest.email)
        .catch(
          console.error
      );
      whatsapp.whatsapp(guest.guestname, guest.phone, host.fullname, emailLink)
        .catch(
          console.error
        );
    });

    res.json(result);
  });
};

updateFriends = (userId, friends) => {
  User.findById(userId).then((result) => {
    if (result.guests.length === 0) {
      result.guests = [...friends]
      result.save()
    } else {

      friends.map(friend => {
        if (result.guests.filter(guest => guest.email === friend.email).length === 0) {
          result.guests.push(friend);
        }
      })
      result.save();
    }
  });
}

exports.storeRejection = async (req, res) => {

  const hash = {
    iv: req.body.iv,
    content: req.body.content
  }
  const data = JSON.parse(decrypt(hash))
  let guestName
  let invite
  await Invite.findById(data._id)
    .populate('user')
    .then((result) => {
      
      invite = result

      invite.guests.map((u, index) => {
      
        if (u.email == data.email) {
          guestName = u.guestname
          invite.guests[index] = {
            ...invite.guests[index].toObject(),
            "rsvp_status": false,
            "responseuser_response": req.body.reason 
          }
        }

      })
      invite.save()

      const message = `<div style="font-family:verdana">Guest : ${guestName} is rejected with the following reason
        <p>${req.body.reason}</p></div>`

      sendEmail.main('Priceless Family - Invite rejection', message, invite.user.email).catch(
        console.error
      );

      return res.send(invite)
      
    })
}
