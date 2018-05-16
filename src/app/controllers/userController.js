const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json");

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

/* rota para listar todos os usuários */
exports.getAll = async (req, res, next) => {
    const query = User.find().populate("groupTasks");
    query.exec(async (error, docs) => {
        if (docs) {
            const users = docs.map(doc => {
                doc.groupTasks = doc.groupTasks || [];
                return {
                    id: doc._id,
                    name: doc.name,
                    email: doc.email,
                    groups: doc.groupTasks.map(group => {
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
    const query = User.findById(req.params.userId).populate("groupTasks");
    query.exec(async (error, doc) => {
        if (doc) {
            doc.groupTasks = doc.groupTasks || [];
            const user = {
                id: doc._id,
                name: doc.name,
                email: doc.email,
                groups: doc.groupTasks.map(group => {
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
                return res.status(500).send({
                    error: "Intenal error, please try again."
                });
            }
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
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error: "Registration failed, please tray again."
        });
    }
};

/* Rota para atualizar usuários */
exports.update = async (req, res, next) => {
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

    User.findByIdAndUpdate(
        req.params.userId, {
            name,
            password,
            email
        }, {
            new: true
        },
        (error, user) => {
            if (error)
                return res.status(500).send({
                    error: "Internla error, please try again."
                });
            else
                return res.send({
                    id: user._id,
                    name: user.name,
                    email: user.email
                });
        }
    );
};

exports.delete = async (req, res, next) => {
    try {
        const user = await User.findByIdAndRemove(req.params.userId);
        if (!user) {
            return res.status(410).send({
                message: "Cannot delete user, because he's gone."
            });
        }
        const response = {
            message: "User delete successfull."
        };
        return res.status(202).send(response);
    } catch (error) {
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
            if (user.groupTasks.length === 0) {
                user.groupTasks.push(groupId)
            } else {
                let check = false
                /* verificando se o id do grupo ja existe na lista de grupos do usuário */
                for (let j = 0; j < user.groupTask.length; j++) {
                    if (user.groupTask[j] === groupId)
                        check = true

                }
                if (!check) {
                    await user.groupTasks.push(groupId)
                }
            }
            await User.findByIdAndUpdate(users[i], user, {
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
            user.groupTasks = user.groupTasks.filter(group => {
                return group.toString() !== groupId.toString()
            })

            const {
                name,
                email,
                password,
                groupTasks
            } = user
            await User.findByIdAndUpdate(users[i], {
                name,
                email,
                password,
                groupTasks
            }, {
                new: true
            })
        }
        return true
        // await Promise.all(
        // )
    } catch (error) {
        return error
    }
}