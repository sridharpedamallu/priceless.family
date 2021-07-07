const express = require('express')
const router = express.Router()

const party = require('../controllers/party.contoller')
const auth = require('../middleware/auth')

router.get('/get-categories', party.getCategories)
router.get('/:party', party.getParty)
router.get('/', auth.verify, party.getParties)
router.post('/get-menu-by-category', auth.verify, party.getMenuByCategory)
router.delete('/delete-party/:party', auth.verify, party.deleteParties)
router.post('/new-party', auth.verify, party.newParty)
router.post('/copy-party', auth.verify, party.copyParty)
router.post('/new-menu-item', auth.verify, party.newMenuItem)
router.post('/rename-party', auth.verify, party.renameParty)
router.post('/edit-menu-item', auth.verify, party.editMenuItem)
router.post('/delete-menu-item', auth.verify, party.delMenuItem)
router.post('/set-package-item', auth.verify, party.setPackageItem)

module.exports = router
