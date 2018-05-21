const Group = require("../models/Group");
const User = require("../models/User");
const UserControl = require('./userController')

exports.getAll = async (req, res, next) => {
    try {
        const query = Group.find({
            members: {
                "$in": [req.userId]
            }
        }).populate(['categories', 'members'])
        query.exec(async (error, groups) => {
            /* é retornado um erro caso o grupo não seja encontrado, esse erro é repassado ao usuário com um 404 . */
            if (error) {
                return res.status(404).send({
                    error: "Group Not found."
                });
            }
            let response = groups.map(group => {
                group.categories = group.categories || [];
                return {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    members: group.members.map(member => {
                        return {
                            id: member._id,
                            name: member.name,
                            email: member.email
                        }
                    }),
                    categories: group.categories.map(task => {
                        return {
                            id: task._id,
                            name: task.name
                        };
                    })
                };
            });
            if (response.length === 0) {
                return res.status(202).send({
                    message: "No groups found."
                });
            } else {
                return res.send(response);
            }
        });
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

exports.getById = async (req, res, next) => {
    try {
        const query = Group.findOne({

            _id: req.params.groupId,
            members: {
                "$in": [req.userId]
            }
        }).populate(['members', 'categories'])
        query.exec(async (error, group) => {
            /* é retornado um erro caso o grupo não seja encontrado, esse erro é repassado ao usuário com um 404 . */
            if (!group) {
                return res.status(404).send({
                    error: "Group Not found."
                });
            } else {
                /*  verificando se o valor de categories é unfined, caso seja ele recebe um vetor vazio */
                group.categories = group.categories || [];
                /* retornando dados do grupo */
                return res.status(200).send({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    members: group.members.map(member => {
                        return {
                            id: member._id,
                            name: member.name,
                            email: member.email
                        }
                    }),

                    categories: group.categories.map(task => {
                        return {
                            id: task._id,
                            name: task.name
                        };
                    })
                });
            }
        });
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

exports.create = async (req, res, next) => {
    try {
        if (!req.body.name)
            return res.status(428).send({
                error: "Name cannot be null. "
            });
        else {
            let {
                name,
                description,
                members
            } = req.body;
            description = description || "";
            Group.create({
                name,
                description
            }, async (error, group) => {
                if (error)
                    return res.status(500).send({
                        error: "internal error, please try again."
                    });
                else {
                    await group.members.push(req.userId)
                    await Promise.all(members.map(async member => {
                        await group.members.push(member)
                    }))
                    await group.save()
                    await UserControl.addIdGroupInUsers(group.id, group.members)
                    const query = Group.findById(group.id).populate('members')
                    query.exec((error, query_group) => {
                        if (query_group)
                            return res.send({
                                id: query_group.id,
                                name: query_group.name,
                                description: query_group.description,
                                members: query_group.members.map(member => {
                                    return {
                                        id: member.id,
                                        name: member.name,
                                        email: member.email
                                    }
                                })
                            });
                    })

                }

            });
        }
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

exports.update = async (req, res, next) => {
    try {
        /* verificando se o nome do grupo é fornecido na requisição */
        if (!req.body.name)
            /* avisa que o nome não pode ser nulo/vazio */
            return res.status(428).send({
                error: "Name cannot be null. "
            });
        else {
            let {
                name,
                description,
                members
            } = req.body;
            description = description || "";
            const grupo = await Group.findOne({

                _id: req.params.groupId,
                members: {
                    "$in": [req.userId]
                }
            })
            if (!grupo)
                return res.status(404).send({
                    error: "Group Not Found."
                })
            Group.findOneAndUpdate({

                _id: req.params.groupId,
                members: {
                    "$in": [req.userId]
                }
            }, {
                name,
                description
            }, {
                new: true
            }, async (error, group) => {
                if (error) {
                    return res.status(500).send({
                        error: "internal error, please try again."
                    });
                } else {
                    let aux_members = []
                    for (let i = 0; i < group.members.length; i++) {
                        if (!members.find(memb => {
                                return memb._id.toString() === group.members[i].toString()
                            })) {
                            aux_members.push(group.members[i])
                        }

                    }
                    await UserControl.removeIdGroupInUsers(group.id, aux_members)
                    group.members = []
                    await group.members.push(req.userId);
                    await Promise.all(members.map(async member => {
                        await group.members.push(member)
                    }))
                    await group.save()
                    await UserControl.addIdGroupInUsers(group.id, group.members)
                    const query = Group.findById(group.id).populate('members')
                    query.exec((error, query_group) => {
                        if (query_group)
                            return res.send({
                                id: query_group.id,
                                name: query_group.name,
                                description: query_group.description,
                                members: query_group.members.map(member => {
                                    return {
                                        id: member.id,
                                        name: member.name,
                                        email: member.email
                                    }
                                })
                            });

                    })

                }

            });
        }
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        return res
            .status(500)
            .send({
                error: "Internal  error, plaese try again."
            });
    }
};

/* rota para deletar um groupo */
exports.delete = async (req, res, next) => {
    try {
        const group = await Group.findOne({

            _id: req.params.groupId,
            members: {
                "$in": [req.userId]
            }
        })
        await UserControl.removeIdGroupInUsers(group.id, group.members)
        Group.findOneAndRemove({

            _id: req.params.groupId,
            members: {
                "$in": [req.userId]
            }
        }, (error, group) => {
            /* verificando se o grupo foi encontrado, caso não seja encontrado significa que o grupo não existe mais ou nunca existiu, por isso é retornado um 410. */
            if (error)
                return res.status(410).send({
                    error: "Group not found, please try again."
                });
            /* caso não esta erro,  ele foi deletado com sucesso, é retornado uma messagem e um 202. */
            else {
                return res.status(202).send({
                    message: "Group delete Successfull"
                });
            }
        });
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        return res
            .status(500)
            .send({
                error: "Internal  error, plaese try again."
            });
    }
};



/* método para adicionar a referência de uma tarefa a um grupo */
exports.addIdCategoryInGroup = async (groupId, categoryId) => {
    try {
        const group = await Group.findById(groupId)
        if (!group.categories.find(category => {
                return category === categoryId
            })) {
            await group.categories.push(categoryId)
            let {
                name,
                description,
                members,
                categories
            } = group
            await Group.findByIdAndUpdate(groupId, {
                name,
                description,
                members,
                categories
            })
        }
        return true

    } catch (error) {
        return false
    }
}

/* método para remover a referência de uma tarefa de um grupo */
exports.removeIdCategoryInGroup = async (groupId, categoryId) => {
    try {
        const group = await Group.findById(groupId)
        group.categories = group.categories.filter(category => {
            return category.toString() !== categoryId.toString()
        })
        let {
            name,
            description,
            members,
            categories
        } = group
        await Group.findByIdAndUpdate(groupId, {
            name,
            description,
            members,
            categories
        })
        return true

    } catch (error) {
        return false
    }
}