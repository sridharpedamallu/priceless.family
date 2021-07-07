const dotenv = require("dotenv");
const Party = require('../models/party.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');

const sendEmail = require('../email')

dotenv.config();

exports.getCategories = async (req, res) => {

    await Category.find().then((result) => {
        return res.send(result)
    })

}

exports.getParties = async (req, res) => {

    await Party.find({
        user: req.user.data.id
    }).sort({createdAt: -1})
        .exec(function (err, docs) {
            return res.send(docs)
        })
}

exports.getParty = async (req, res) => {
    await Party.findById(req.params.party)
        .then(result => {
            return res.send(result)
        })
}


exports.deleteParties = async (req, res) => {

    await Party.findByIdAndDelete(req.params.party)
        .then(result => {
            return res.send({message: 'Party deleted successfully'})
        })
}

exports.newParty = async (req, res) => {

    const party = new Party({
        user: req.user.data.id,
        title: req.body.title,
        packageitem: req.body.packageitem
    })

    party.save();

    return res.send(party);

}

exports.copyParty = async (req, res) => {

    await Party.findById(req.body._id)
        .then(result => {
            const party = new Party({
                user: req.user.data.id,
                title: req.body.title,
                categories: [...result.categories] 
            })

            party.save()

            return res.send(party)
        
        })

}

exports.renameParty = async (req, res) => {

    await Party.findByIdAndUpdate(req.body._id, {title: req.body.title}, {new: true},
        function (err, docs) {
            if (err) {
                console.log(err)
            } else {
                return res.send(docs)
            }
        });

}

exports.newMenuItem = async (req, res) => {
    
    let party
    let complete = false;
    await Party.findById(req.body.party)
        .then(async (result) => {
            party = result
            if (party.categories.length === 0) {
                party.categories = [
                    {
                        category: req.body.category,
                        menuitems: [
                            {
                                title: req.body.title,
                                packageitem: req.body.packageitem
                            }
                        ]
                    }
                ]
                party.save()
                
                return res.send(party)
            } else {
                await Party.findOne({"_id": req.body.party, "categories.category": req.body.category})
                    .then(result2 => {
                        if (!result2) {
                            party.categories = [
                                ...party.categories,
                                {
                                    category: req.body.category,
                                    menuitems: [
                                        {
                                            title: req.body.title,
                                            packageitem: req.body.packageitem
                                        }
                                    ]
                                }
                            ]
                            
                            party.save()
                            return res.send(party)
                        } else {
                            const item = party.categories.filter(category => category.category == req.body.category)
                            item[0].menuitems = [
                                ...item[0].menuitems,
                                {
                                    title: req.body.title,
                                    packageitem: req.body.packageitem
                                }
                            ]
                            party.save()
                            return res.send(party)
                        }

                    })
            }
        })

}

exports.getMenuByCategory = async (req, res) => {
    await Party.findOne({"_id": req.body.party, "categories.category": req.body.category})
        .then(result => {
            if (result && result.categories.length) {
                return res.send(result.categories)
            } else {
                return res.send([])
            }
        })
}

// exports.delParty = async (req, res) => {
//
//     const party = new Party({
//         user: req.user.data.id,
//         title: req.body.title,
//         preferences: [
//             ...req.body.preferences
//         ]
//     })
//
//     party.save()
//
//     return res.send(party)
//
// }

exports.delMenuItem = async (req, res) => {

    const reqParty = req.body
    await Party.findById(reqParty.party)
        .then(async (result) => {
            const party = result
            await party.categories.map((category, index) => {
                if (category.category == reqParty.category) {
                    party.categories[index].menuitems.map((m, i) => {
                        if (m._id == reqParty.menuItem) {
                            party.categories[index].menuitems.splice(i, 1);
                            party.save();
                            return res.send(m);
                        }
                    })
                }
            })
        })
}

exports.editMenuItem = async (req, res) => {

    const reqParty = req.body
    await Party.findById(reqParty.party)
        .then(async (result) => {
            const party = result
            await party.categories.map((category, index) => {
                if (category.category == reqParty.category) {
                    party.categories[index].menuitems.map((m, i) => {
                        if (m._id == reqParty.menuItem) {
                            party.categories[index].menuitems[i].title = req.body.title
                            party.save()
                            return res.send(m)
                        }
                    })
                }
            })
        })
}

exports.setPackageItem = async (req, res) => {

    const reqParty = req.body
    await Party.findById(reqParty.party)
        .then((result) => {
            const party = result
            party.categories.map((category, index) => {
                if (category.category == reqParty.category) {
                    party.categories[index].menuitems.map((m, i) => {

                        if (m._id == reqParty.menuItem) {
                            party.categories[index].menuitems[i].packageitem = reqParty.setPackageFlag
                        } else {
                            party.categories[index].menuitems[i].packageitem = false
                        }

                    })
                }
            })
            party.save()
            return res.send(party)
        })
}
