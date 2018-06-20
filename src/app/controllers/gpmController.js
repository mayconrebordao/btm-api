const Group = require("../models/Group");
const UserControl = require('./userController')

const utils = require('./utils')

exports.getAll = async (req, res, next) => {
    try {
        const query = Group.find({
            _id: req.groupId,
            $or: [{
                members: {
                    $in: [req.userId]
                }
            }, {
                owner: req.userId
            }]
        }).select('members').populate('members')
        query.exec(async (error, members) => {
            members.members = members.members || []
            if (members && members.members.length !== 0) {
                return res.send({
                    members: members.members
                })
            } else {
                return res.status(202).send({
                    error: "No members Found."
                })
            }
        })
    } catch (error) {
        return utils.ServerError(res)
    }
}

exports.add = async (req, res, next) => {
    try {
        const group = await Group.find({
            _id: req.groupId,
            $or: [{
                members: {
                    $in: [req.userId]
                }
            }, {
                owner: req.userId
            }]
        })
        if (group) {
            // console.clear()
            console.log('teste');

            if (await UserControl.addIdGroupinvitations(req.groupId, req.body)) {
                return res.send()
            } else {
                return res.status(500).send({
                    error: "erro"
                })
            }

        }
    } catch (error) {
        return utils.ServerError(res)
    }
}

exports.rm = async (req, res, next) => {
    try {
        const group = await Group.find({
            _id: req.groupId,
            $or: [{
                members: {
                    $in: [req.userId]
                }
            }, {
                owner: req.userId
            }]
        })
        if (group) {
            // console.clear()
            console.log('teste');

            if (await UserControl.removeIdGroupinvitations(req.groupId, req.params.memberId) || await UserControl.removeIdGroupInUsers(req.groupId, req.params.memberId)) {
                return res.send()
            } else {
                return res.status(500).send({
                    error: "erro"
                })
            }

        }

    } catch (error) {
        return utils.ServerError(res)
    }
}