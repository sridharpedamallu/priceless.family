const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

exports.verify = function(req, res, next){

    if (!req.headers.authorization) {
        return res.sendStatus(401)
    }

    let accessToken = req.headers.authorization.split(' ', 2)[1]

    if (!accessToken){
        return res.sendStatus(403)
    }

    let payload
    try{
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        })

    }
    catch(e){
        res.sendStatus(401)
    }
}
