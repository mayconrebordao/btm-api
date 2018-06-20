const Group = require('../models/Group')

exports.ServerError = async (res) => {
    return res.status(500).send({
        error: "Internal server error, plese try again."
    })
}

exports.checkId = async (req) => {
    try {

    } catch (error) {

    }
}