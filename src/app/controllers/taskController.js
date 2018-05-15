const Task = require("../models/Task");

exports.getAll = async (req, res, next) => {
    try {
        Task.find((error, tasks) => {
            if (error) {
                return res.status(500).send({
                    errot: "Internal server Error, please try again."
                });
            } else {
                let response = tasks.map(task => {
                    task.users = task.users || [];
                    // if(task.users)
                    return {
                        id: task._id,
                        name: task.name,
                        category: task.category,
                        description: task.description,
                        deadline: task.deadline,
                        users: task.users
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
        Task.findById(req.params.taskId, (error, task) => {
            if (error) {
                return res.status(404).send({
                    error: "Task not found."
                });
            } else {
                return res.send(task);
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
        if (!req.body.name || !req.body.category || req.body.private) {
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
        users = [...users, {
            userId: req.userId
        }]
        // console.log(users);

        Task.create({
            name,
            description,
            private,
            category,
            deadline
        }, async (error, task) => {
            if (!error) {
                console.log("teste");

                users = users.map(user => {
                    return {
                        _id: user.userId
                    }
                })
                console.log(users);
                await Promise.all(users.map(async user => {
                    await task.users.push(user)
                }))
                await task.save()

                return res.status(200).send({
                    id: task._id,
                    name: task.name,
                    description: task.description,
                    deadline: task.deadline,
                    private: task.private,
                    users: users.map(user => {
                        return {
                            id: user._id
                        }
                    })
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
        if (!req.body.name || !req.body.category || req.body.private) {
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
        users = [...users, {
            userId: req.userId
        }]
        // console.log(users);

        Task.findByIdAndUpdate(req.params.taskId, {
            name,
            description,
            private,
            category,
            deadline
        }, {
            new: true
        }, async (error, task) => {
            if (!error) {
                console.log("teste");

                users = users.map(user => {
                    return {
                        _id: user.userId
                    }
                })
                console.log(users);
                // removendo as tasks 
                // await Task.remove({id: req.params.taskId})
                task.users = []
                await Promise.all(users.map(async user => {
                    await task.users.push(user)
                }))
                await task.save()

                return res.status(200).send({
                    id: task._id,
                    name: task.name,
                    description: task.description,
                    deadline: task.deadline,
                    private: task.private,
                    users: users.map(user => {
                        return {
                            id: user._id
                        }
                    })
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