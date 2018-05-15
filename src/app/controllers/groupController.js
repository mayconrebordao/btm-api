const Group = require("../models/Group");
const User = require("../models/User");
const UserControl = require('./userController')

exports.getAll = async (req, res, next) => {
    try {
        Group.find(async (error, groups) => {
            // é retornado um erro caso o grupo não seja encontrado, esse erro é repassado ao usuário com um 404 .
            if (error) {
                return res.status(404).send({
                    error: "Group Not found."
                });
            }
            let response = groups.map(group => {
                group.tasks = group.tasks || [];
                return {
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    tasks: group.tasks.map(task => {
                        return {
                            id: task._id
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
            // verificando se o valor de tasks é unfined, caso seja ele recebe um vetor vazio
            // group.tasks = group.tasks || [];
            // // retornando dados do grupo
            // return res.status(200).send({
            //     id: group._id,
            //     name: group.name,
            //     description: group.description,
            //     tasks: group.tasks.map(task => {
            //         return {
            //             id: task._id
            //         };
            //     })
            // });
        });
    } catch (error) {
        // informa o usuário da api que houve um error interno no servidor
        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

exports.getById = async (req, res, next) => {
    try {
        Group.findById(req.params.groupId, async (error, group) => {
            // é retornado um erro caso o grupo não seja encontrado, esse erro é repassado ao usuário com um 404 .
            if (!group) {
                return res.status(404).send({
                    error: "Group Not found."
                });
            } else {

                console.log(group);


                // verificando se o valor de tasks é unfined, caso seja ele recebe um vetor vazio
                group.tasks = group.tasks || [];
                // retornando dados do grupo
                return res.status(200).send({
                    id: group._id,
                    name: group.name,
                    description: group.description,
                    tasks: group.tasks.map(task => {
                        return {
                            id: task._id
                        };
                    })
                });
            }
        });
    } catch (error) {
        // informa o usuário da api que houve um error interno no servidor
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
        // informa o usuário da api que houve um error interno no servidor
        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

exports.update = async (req, res, next) => {
    try {
        // verificando se o nome do grupo é fornecido na requisição
        if (!req.body.name)
            // avisa que o nome não pode ser nulo/vazio
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
            const grupo = await Group.findById(req.params.groupId)
            if (!grupo)
                return res.status(404).send({
                    error: "Group Not Found."
                })
            Group.findByIdAndUpdate(req.params.groupId, {
                name,
                description
            }, {
                new: true
            }, async (error, group) => {


                if (error) {

                    // console.log(error);

                    return res.status(500).send({
                        error: "internal error, please try again."
                    });
                } else {
                    // console.log(group.members);

                    let aux_members = []
                    // members.push({
                    //     _id: req.userId
                    // })
                    for (let i = 0; i < group.members.length; i++) {
                        if (!members.find(memb => {
                                // console.log("memb");

                                // console.log(memb._id);
                                // console.log("group.members");

                                // console.log(group.members[i].toString());
                                return memb._id.toString() === group.members[i].toString()
                            })) {
                            // console.log(group.members[i]);

                            aux_members.push(group.members[i])
                        }

                    }
                    // console.log("aux_members ");

                    // console.log(
                    //     aux_members);

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

                            // await query_group.members.map(async member =>{
                            //     User.findByIdAndUpdate(member.id)
                            // })

                            return res.send({
                                id: query_group.id,
                                name: query_group.name,
                                description: query_group.description,
                                members: query_group.members.map(member => {
                                    // console.log(member.id, member._id);

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
        console.log(error);

        // informa o usuário da api que houve um error interno no servidor
        return res
            .status(500)
            .send({
                error: "Internal  error, plaese try again."
            });
    }
};

// rota para deletar um groupo
exports.delete = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId)
        await UserControl.removeIdGroupInUsers(group.id, group.members)


        Group.findByIdAndRemove(req.params.groupId, (error, group) => {
            // verificando se o grupo foi encontrado, caso não seja encontrado significa que o grupo não existe mais ou nunca existiu, por isso é retornado um 410.
            if (error)
                return res.status(410).send({
                    error: "Group not found, please try again."
                });
            // caso não esta erro,  ele foi deletado com sucesso, é retornado uma messagem e um 202.
            else {


                return res.status(202).send({
                    message: "User delete Successfull"
                });
            }
        });
    } catch (error) {
        console.log(error);

        // informa o usuário da api que houve um error interno no servidor
        return res
            .status(500)
            .send({
                error: "Internal  error, plaese try again."
            });
    }
};