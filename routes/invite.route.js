const express = require('express')
const router = express.Router()

const invite = require('../controllers/invite.contoller')
const auth = require('../middleware/auth')

router.post('/', auth.verify, invite.store)
router.get('/', auth.verify, invite.index)
router.get('/:invite', auth.verify, invite.getInviteDetails)
router.delete('/:invite', auth.verify, invite.deleteInvite)
router.get('/get-invite-by-party/:party', auth.verify, invite.getInviteByPartyId)
router.post('/post-response', invite.storeResponse)
router.post('/reject-invite', invite.storeRejection)
router.post('/guest-details', invite.getGuestDetails)

module.exports = router
