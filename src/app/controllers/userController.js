const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authConfig = require("../../config/auth.json");
const utils = require('./utils')
const GroupControl = require('./groupController')
const Group = require('../models/Group')

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

/* rota para listar todos os usuários */
exports.getAll = async (req, res, next) => {
    const query = User.find().populate("groups").sort({
        name: 1
    });
    query.exec(async (error, docs) => {
        if (docs) {
            const users = docs.map(doc => {
                doc.groups = doc.groups || [];
                return {
                    id: doc._id,
                    name: doc.name,
                    email: doc.email,
                    groups: doc.groups.map(group => {
                        return {
                            id: group._id,
                            name: group.name,
                            description: group.description
                        };
                    })
                }
            });
            return res.status(200).send(
                users
            );
        } else return res.status(404).send({
            error: "User not found."
        });
    });
};

/* Rota para listar apenas um usuário */
exports.getById = async (req, res, next) => {
    const query = User.findById(req.params.userId).populate("groups").select('password name email groups');
    query.exec(async (error, doc) => {
        if (doc) {
            doc.groups = doc.groups || [];
            const user = {
                id: doc._id,
                name: doc.name,
                email: doc.email,
                groups: doc.groups.map(group => {
                    return {
                        id: group._id,
                        name: group.name,
                        description: group.description
                    };
                })
            };
            return res.status(200).send(
                user
            );
        } else return res.status(404).send({
            error: "User not found."
        });
    });
};

exports.create = async (req, res, next) => {
    try {
        const {
            email
        } = req.body;

        /* verificando se os dados de cadastro do usário não estão vazios */
        if (!req.body.name || !req.body.password || !req.body.email) {
            return res.status(428).send({
                error: "Email, password or name  is null, but can not be null."
            });
        }

        /* verificando se o email ja esta cadastrado no sistema, ou seja, se o usuário ja existe */
        if (await User.findOne({
                email
            })) {
            return res.status(409).send({
                error: "email is already in using!!"
            });
        }
        /* criando usuário */
        User.create(req.body, (error, user) => {
            if (error) {
                console.log({
                    error: error
                })
                return res.status(500).send({
                    error: "Intenal error, please try again."
                });
            } else {
                // console.log("send user data");


                const response = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken({
                        id: user._id
                    })
                };
                return res.status(200).send(
                    response
                );
            }
        });
    } catch (error) {
        console.log({
            error: error
        });
        return res.status(500).send({
            error: "Registration failed, please tray again."
        });
    }
};

/* Rota para atualizar usuários */
exports.update = async (req, res, next) => {
    try {
        const {
            name,
            password,
            email
        } = req.body;
        if (!name || !password || !email) {
            return res.status(428).send({
                error: "Email, password or name is null, but can not be null."
            });
        }
        const data = await User.findById(req.params.userId)
        console.log({
            data_f: data.id
        });

        if (data) {

            User.findOneAndUpdate({
                    _id: req.params.userId
                }, {
                    user_id: req.params.userId,
                    name,
                    password,
                    email
                }, {
                    new: true
                },
                async (error, user) => {
                    console.log({
                        error: error
                    })
                    if (error)
                        return res.status(404).send({
                            error: "User not found, please try again."
                        });
                    else {
                        // await user.save()
                        return res.send({
                            id: user._id,
                            name: user.name,
                            email: user.email
                        });
                    }
                }
            );
        }
    } catch (error) {
        console.log(error)
        return utils.ServerError(res)
    }
};

exports.delete = async (req, res, next) => {
    try {
        const user = await User.findOne({
            _id: req.params.userId
        })
        await Group.find({
            owner: req.params.userId
        }, async (error, owners) => {
            owners = owners || []
            // console.log(owners);

            await Promise.all(owners.map(async owner => {
                await GroupControl.removeGroup(owner.id)
            }))
        })

        await Group.find({
            members: {
                $in: [req.userId]
            }
        }, async (error, members) => {
            members = members || []
            await Promise.all(members.map(async member => {
                member.members = member.members.filter(memb => {
                    // console.log(member.members);


                    return memb.toString() !== req.userId.toString()
                })
                await Group.findOneAndUpdate({
                    _id: member.id
                }, member, {
                    new: true
                })
            }))
        })

        const useraux = await User.findByIdAndRemove(req.params.userId);
        console.log(user);

        if (!useraux) {
            return res.status(410).send({
                message: "Cannot delete user, because he's gone."
            });
        }
        const response = {
            message: "User delete successfull."
        };
        return res.status(202).send(response);
    } catch (error) {
        console.log(error);

        return res.status(500).send({
            message: "Internal error.Cannot delete user, please Try again."
        });
    }
};

/* método para adicionar a referência de um grupo a um usuário */
exports.addIdGroupInUsers = async (groupId, users) => {
    try {
        for (let i = 0; i < users.length; i++) {
            const user = await User.findById(users[i])
            if (user.groups.length === 0) {
                user.groups.push(groupId)
            } else {
                let check = false
                /* verificando se o id do grupo ja existe na lista de grupos do usuário */
                for (let j = 0; j < user.groups.length; j++) {
                    if (user.groups[j] === groupId)
                        check = true

                }
                if (!check) {
                    await user.groups.push(groupId)
                }
            }

            const {
                name,
                email,
                password,
                groups,
                invitations
            } = user
            await User.findOneAndUpdate({
                _id: users[i]
            }, {
                user_id: user.id,
                name,
                email,
                password,
                groups,
                invitations
            }, {
                new: true
            })
        }
        return true
    } catch (error) {
        return error
    }
}

/* método para remover a referência de um grupo de um usuário */
exports.removeIdGroupInUsers = async (groupId, users) => {
    try {
        for (let i = 0; i < users.length; i++) {
            const user = await User.findById(users[i])
            let tasks = []
            /* removendo apenas um grupo da lista de grupos do usuários */
            user.groups = user.groups.filter(group => {
                return group.toString() !== groupId.toString()
            })

            const {
                name,
                email,
                password,
                groups,
                invitations
            } = user
            await User.findOneAndUpdate({
                _id: users[i]
            }, {
                user_id: user.id,
                name,
                email,
                password,
                groups,
                invitations
            }, {
                new: true
            })
        }
        return true
    } catch (error) {
        return error
    }
}

/* método para adicionar a convite de um grupo a um usuário */
exports.addIdGroupinvitations = async (groupId, users) => {
    try {
        for (let i = 0; i < users.length; i++) {
            console.log({
                email: users[i].email
            });

            const user = await User.findOne({
                email: users[i].email
            })
            user.invitations = user.invitations || []
            if (user.invitations.length === 0) {
                user.invitations.push(groupId)
            } else {
                let check = false
                console.log(groupId);

                /* verificando se o id do grupo ja existe na lista de grupos do usuário */
                for (let j = 0; j < user.invitations.length; j++) {
                    console.log(user.invitations[j]);

                    if (user.invitations[j].toString() === groupId.toString())
                        check = true

                }
                console.log(check);

                if (!check) {
                    await user.invitations.push(groupId)
                }
            }
            const {

                name,
                email,
                password,
                invitations,
                groups
            } = user
            await User.findOneAndUpdate({
                _id: user.id
            }, {
                user_id: user.id,
                name,
                email,
                password,
                invitations,
                groups
            }, {
                new: true
            })
        }
        return true
    } catch (error) {
        console.log(error);

        return error
    }
}

/* método para remover a convite de um grupo de um usuário */
exports.removeIdGroupinvitations = async (groupId, user) => {
    try {

        const useraux = await User.findById(user)

        /* removendo apenas um grupo da lista de grupos do usuários */
        useraux.invitations = useraux.invitations.filter(group => {
            return group.toString() !== groupId.toString()
        })

        /* removendo apenas um grupo da lista de convites do usuários */
        useraux.groups = useraux.groups.filter(group => {
            return group.toString() !== groupId.toString()
        })

        const {

            name,
            email,
            password,
            invitations,
            groups
        } = useraux
        await User.findOneAndUpdate({
            _id: user
        }, {
            user_id: useraux.id,
            name,
            email,
            password,
            invitations,
            groups
        }, {
            new: true
        })
        return true
    } catch (error) {
        return error
    }
}