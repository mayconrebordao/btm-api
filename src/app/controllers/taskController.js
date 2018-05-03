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
                    return {
                        id: task._id,
                        name: task.name,
                        category: task.category,
                        description: task.description,
                        deadline: task.deadline,
                        users: task.users.map(user => {
                            return {
                                id: user._id
                            };
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
        Task.findById(req.params.taskId, (error, task) => {
            if (error) {
                return res.status(404).send({
                    error: "Task not found."
                });
            } else {
                return res.send({});
            }
        });
    } catch (error) {
        return res.status(500).send({
            errot: "Internal server Error, please try again."
        });
    }
};

exports.create = async (req, res, next) => {
    return res.send({ ok: true });
};

