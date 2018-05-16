const Task = require("../models/Task");
const User = require("../models/User");
const GroupControl = require('../controllers/groupController')

exports.getAll = async (req, res, next) => {
    try {
        const query = Task.find({
            belongs_to: req.groupId
        }).populate(['belongs_to', 'users'])
        query.exec((error, tasks) => {
            if (error) {
                return res.status(500).send({
                    errot: "Internal server Error, please try again."
                });
            } else {
                let response = tasks.map(task => {
                    task.users = task.users || [];
                    return {
                        id: task._id,
                        name: task.name,
                        category: task.category,
                        description: task.description,
                        deadline: task.deadline,
                        belongs_to: {
                            id: task.belongs_to.id,
                            group_name: task.belongs_to.name,
                            description: task.belongs_to.description
                        },
                        users: task.users.map(user => {
                            return {
                                id: user.id,
                                name: user.name,
                                email: user.email
                            }
                        })
                    };
                });
                if (response.length === 0) {
                    return res.status(202).send({
                        message: "No tasks Found."
                    });
                } else return res.send(response);
            }
        });
    } catch (error) {
        return res.status(500).send({
            errot: "Internal server Error, please try again."
        });
    }
};

exports.getById = async (req, res, next) => {
    try {
        const query = Task.findOne({
            _id: req.params.taskId,
            belongs_to: req.groupId
        }).populate(['belongs_to', 'users'])
        query.exec((error, task) => {
            if (!task) {
                return res.status(410).send({
                    error: "No tasks found."
                });
            } else {
                return res.send({
                    id: task._id,
                    name: task.name,
                    category: task.category,
                    description: task.description,
                    deadline: task.deadline,
                    belongs_to: {
                        id: task.belongs_to.id,
                        group_name: task.belongs_to.name,
                        description: task.belongs_to.description
                    },
                    users: task.users.map(user => {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        }
                    })
                });
            }
        });
    } catch (error) {
        return res.status(500).send({
            errot: "Internal server Error, please try again."
        });
    }
};

exports.create = async (req, res, next) => {

    try {
        if (!req.body.name || !req.body.category || req.body.private === undefined) {
            return res.status(428).send({
                error: "Pre condition failed, please verify request body a d try again. "
            })
        }
        let {
            name,
            description,
            private,
            category,
            deadline,
            users
        } = req.body
        description = description || ""
        users = users || []
        users = users.map(user => {
            return {
                _id: user.userId
            }
        })
        users.push({
            _id: req.userId
        })
        let check = [],
            aux = []
        for (let i = 0; i < users.length; i++) {
            try {
                if (!await User.findById(users[i])) {
                    check.push(users[i])
                } else {
                    aux.push(users[i])
                }

            } catch (error) {

                check.push(users[i])
            }

        }
        users = aux
        Task.create({
            name,
            description,
            private,
            category,
            deadline,
            belongs_to: req.groupId
        }, async (error, task) => {
            if (!error) {
                await Promise.all(users.map(async user => {
                    await task.users.push(user)
                }))
                await task.save()
                await GroupControl.addIdTaskInGroup(req.groupId, task.id)
                const query = Task.findById(task._id).populate(['users', 'belongs_to'])
                query.exec(async (error, task) => {
                    if (task) {
                        let response = {
                            id: task._id,
                            name: task.name,
                            category: task.category,
                            description: task.description,
                            deadline: task.deadline,
                            belongs_to: {
                                id: task.belongs_to.id,
                                group_name: task.belongs_to.name,
                                description: task.belongs_to.description
                            },
                            users: task.users.map(user => {
                                return {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email
                                }
                            })
                        };
                        if (check.length !== 0) {
                            response.msg = {
                                error: "Alguns usuários informados não foram encontrados, segue a lista:",
                                users: check
                            }
                        }
                        return res.status(200).send(response)
                    } else {
                        return res.status(500).send({
                            error: "Internal server error, please try again"
                        })

                    }
                })
            } else
                return res.status(500).send({
                    error: "Internal server error, please try again"
                })
        })
    } catch (error) {
        console.log(error);

        return res.status(500).send({
            errot: "Internal server Error, please try again."
        });
    }
};

exports.update = async (req, res, next) => {

    try {
        if (!req.body.name || !req.body.category || req.body.private === undefined) {
            return res.status(428).send({
                error: "Pre condition failed, please verify request body a d try again. "
            })
        }

        let {
            name,
            description,
            private,
            category,
            deadline,
            users
        } = req.body
        description = description || ""

        users = users || []
        users = users.map(user => {
            return {
                _id: user.userId
            }
        })
        users.push({
            _id: req.userId
        })
        let check = [],
            aux = []
        for (let i = 0; i < users.length; i++) {
            try {
                if (!await User.findById(users[i])) {
                    check.push(users[i])
                } else {
                    aux.push(users[i])
                }

            } catch (error) {

                check.push(users[i])
            }
        }
        users = aux
        const tarefa = await Task.findOne({
            _id: req.params.taskId,
            belongs_to: req.groupId
        })
        Task.findOneAndUpdate({
                _id: req.params.taskId,
                belongs_to: req.groupId
            }, {
                name,
                description,
                private,
                category,
                deadline,
                belongs_to: req.groupId
            }, {
                new: true,
                populate: 'belongs_to'
            },
            async (error, task) => {
                if (task) {
                    let aux_members = []
                    task.users = []
                    await Promise.all(users.map(async user => {
                        await task.users.push(user)
                    }))
                    await task.save()
                    const query = Task.findById(task._id).populate(['users', 'belongs_to'])
                    query.exec(async (error, task) => {
                        if (task) {
                            const response = {
                                id: task._id,
                                name: task.name,
                                category: task.category,
                                description: task.description,
                                deadline: task.deadline,
                                belongs_to: {
                                    id: task.belongs_to.id,
                                    group_name: task.belongs_to.name,
                                    description: task.belongs_to.description
                                },
                                users: task.users.map(user => {
                                    return {
                                        id: user.id,
                                        name: user.name,
                                        email: user.email
                                    }
                                })
                            };
                            if (check.length !== 0) {
                                response.msg = {
                                    error: "Alguns usuários informados não foram encontrados, segue a lista:",
                                    users: check
                                }
                            }
                            return res.status(200).send(response)
                        } else {
                            return res.status(500).send({
                                error: "Internal server error, please try again"
                            })

                        }
                    })
                } else
                    return res.status(404).send({
                        error: "Task Not Found."
                    })
            })
    } catch (error) {
        console.log(error);

        return res.status(500).send({
            errot: "Internal server Error, please try again."
        });
    }
};

/* removendo tarefa */
exports.remove = async (req, res, next) => {
    try {
        const task = Task.findOne({
            _id: req.params.taskId,
            belongs_to: req.groupId
        })
        if (!task)
            return res.status(404).send({
                error: "Task Not Found."
            })
        else {

            await GroupControl.removeIdTaskInGroup(req.groupId, req.params.taskId)
            Task.findOneAndRemove({
                _id: req.params.taskId,
                belongs_to: req.groupId
            }, (error) => {
                if (!error) {
                    return res.status(202).send({
                        msg: "Task Delete Successfull."
                    })
                } else {
                    return res.status(500).send({
                        errot: "Internal server Error, please try again."
                    });
                }
            })

        }
    } catch (error) {
        return res.status(500).send({
            errot: "Internal server Error, please try again."
        });
    }
}