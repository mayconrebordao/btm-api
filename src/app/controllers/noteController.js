const Note = require('../models/Note')
const GroupControl = require('./groupController')
const utils = require('./utils')
utils.ServerError
exports.getAll = async (req, res, next) => {
    try {
        const query = Note.find({
            belongs_to: req.groupId
        })
        query.exec((error, notes) => {
            if (notes) {
                return res.send(notes)
            } else {
                return res.send({
                    error: error
                })
            }
        })
    } catch (error) {
        return utils.ServerError(res)
    }
}
exports.getById = async (req, res, next) => {
    try {
        const query = Note.findOne({
            _id: req.params.noteId,
            belongs_to: req.groupId
        })
        console.clear()
        await Note.findOne({
            _id: req.params.noteId
        }, (error, note) => {
            console.log(note);

        })

        query.exec((error, note) => {
            if (note) {
                return res.send(note)
            } else {
                return res.send({
                    error: error
                })
            }
        })
    } catch (error) {
        return utils.ServerError(res)
    }
}
exports.create = async (req, res, next) => {
    try {
        let {
            name,
            content
        } = req.body
        if (!name || !content) {
            return res.satus(401).send({
                error: "Name or content cannot be null. Please check this and try again."
            })
        } else {
            Note.create({
                name,
                content,
                belongs_to: req.groupId,
                owner: req.userId
            }, async (error, note) => {
                if (error) {
                    return utils.ServerError(res)
                } else {
                    await GroupControl.addIdNoteInGroup(req.groupId, note._id)
                    return res.send(note)
                }
            })
        }
    } catch (error) {
        return utils.ServerError(res)
    }
}
exports.update = async (req, res, next) => {
    try {
        let {
            name,
            content
        } = req.body
        if (!name || !content) {
            return res.satus(401).send({
                error: "Name or content cannot be null. Please check this and try again."
            })
        } else {
            Note.findOneAndUpdate({
                _id: req.params.noteId,
                belongs_to: req.groupId
            }, {
                name,
                content,
                belongs_to: req.groupId,
                owner: req.userId
            }, {
                new: true
            }, async (error, note) => {
                if (error) {
                    return res.status(404).send({
                        error: "Note not Found."
                    })
                } else {
                    return res.send(note)
                }
            })
        }
    } catch (error) {
        return utils.ServerError(res)
    }
}
exports.delete = async (req, res, next) => {
    try {
        Note.findOne({
            _id: req.params.noteId,
            belongs_to: req.groupId
        }, async (error, note) => {
            if (note) {
                if (utils.checkId(req, )) {
                    Note.findOneAndRemove({
                        _id: req.params.noteId,
                        belongs_to: req.groupId
                    }, async (error) => {
                        if (!error) {
                            await GroupControl.removeIdNoteInGroup(req.groupId, req.params.noteId)
                            return res.send({
                                msg: "Note delete successfull"
                            })
                        } else {
                            throw error
                        }
                    })
                }

            } else {
                return res.status(404).send({
                    error: "Note not Found."
                })
            }
        })

    } catch (error) {
        return utils.ServerError(res)
    }
}



exports.removeMore = async (noteList, groupId) => {
    try {
        await Promise.all(noteList.map(async note => {
            await Note.findOneAndRemove({
                _id: note,
                belongs_to: groupId
            })
        }))
        return true
    } catch (error) {
        return false
    }
}