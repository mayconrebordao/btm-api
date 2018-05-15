const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json");

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

// {  "name": "jiren",  "email": "jose@email.com",  "password": "teste"}

// rota para listar todos os usuários


exports.getAll = async (req, res, next) => {
    const query = User.find().populate("groupTask");
    query.exec(async (error, docs) => {
        if (docs) {
            // console.log(docs);
            const users = docs.map(doc => {
                doc.groupTask = doc.groupTask || [];
                return {
                    id: doc._id,
                    name: doc.name,
                    email: doc.email,
                    groups: doc.groupTask.map(group => {
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






// Rota para listar apenas um usuário
exports.getById = async (req, res, next) => {
    const query = User.findById(req.params.userId).populate("groupTask");
    query.exec(async (error, doc) => {
        if (doc) {
            // console.log(doc);
            doc.groupTask = doc.groupTask || [];
            const user = {
                id: doc._id,
                name: doc.name,
                email: doc.email,
                groups: doc.groupTask.map(group => {
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
        // console.log(req.body);
        const {
            email
        } = req.body;

        // verificando se os dados de cadastro do usário não estão vazios
        if (!req.body.name || !req.body.password || !req.body.email) {
            return res.status(428).send({
                error: "Email, password or name  is null, but can not be null."
            });
        }

        // verificando se o email ja esta cadastrado no sistema, ou seja, se o usuário ja existe
        if (await User.findOne({
                email
            })) {
            return res.status(409).send({
                error: "email is already in using!!"
            });
        }
        // criando usuário
        User.create(req.body, (error, user) => {
            // console.clear()
            // console.log(user)
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

// Rota para atualizar usuários
exports.update = async (req, res, next) => {
    const {
        name,
        password,
        email
    } = req.body;
    // console.clear()
    // console.log({ name, password, ema })
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
            // console.log(user)
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


exports.addIdGroupInUsers = async (groupId, users) => {
    try {
        // console.log(users)
        for (let i = 0; i < users.length; i++) {
            const user = await User.findById(users[i])
            // console.log(user);
            // let groupTasks = user.groupTasks
            if (user.groupTasks.length === 0) {
                user.groupTasks.push(groupId)
            } else {
                let check = false
                for (let j = 0; j < user.groupTask.length; j++) {
                    if (user.groupTask[j] === groupId)
                        check = true

                }
                if (!check) {
                    await user.groupTasks.push(groupId)
                }
            }
            // console.log(user)
            await User.findByIdAndUpdate(users[i], user, {
                new: true
            }, async (error, user) => {
                // if (user) console.log(user);

            })
        }
        return true
        // await Promise.all(
        // )
    } catch (error) {
        return error
    }
}

exports.removeIdGroupInUsers = async (groupId, users) => {
    try {
        // console.log(users)
        for (let i = 0; i < users.length; i++) {
            const user = await User.findById(users[i])
            console.log(user.groupTasks);

            let tasks = []
            console.log("filter " +
                user.groupTasks.filter(task => {
                    return task.toString() !== groupId.toString()
                }));

            user.groupTasks = user.groupTasks.filter(group => {
                // console.log(group);
                // console.log(groupId);


                return group.toString() !== groupId.toString()
            })

            // if (user.groupTasks.length === 0) {
            //     user.groupTasks.push(groupId)
            // } else {
            //     let check = false
            //     for (let j = 0; j < user.groupTask.length; j++) {
            //         if (user.groupTask[j] === groupId)
            //             check = true

            //     }
            //     if (!check) {
            //         await user.groupTasks.push(groupId)
            //     }
            // }
            console.log(user)
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
            }, async (error, user) => {
                // if (user) console.log(user);

            })
        }
        return true
        // await Promise.all(
        // )
    } catch (error) {
        return error
    }
}