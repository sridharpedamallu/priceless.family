const express = require('express')
const router = express.Router()

const user = require('../controllers/user.contoller')
const auth = require('../middleware/auth')

router.post('/sign-up', user.signup)
router.post('/sign-in', user.signIn)
router.get('/confirm-email/:id', user.confirm_email)
router.get('/get-friends', auth.verify, user.getFriends)
router.get('/get-location-details/:postcode', user.locationDetails)
router.get('/forgot-password/:email', user.forgotPassword)
router.post('/validate-otp', user.validateOtp)
router.post('/reset-password', user.resetPassword)
router.post('/save-guest', auth.verify, user.saveGuest)
router.delete('/delete-guest/:guest', auth.verify, user.deleteGuest)

module.exports = router
