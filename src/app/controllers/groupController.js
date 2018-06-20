const Group = require("../models/Group");
const User = require("../models/User");
const UserControl = require("./userController");
const CategoryControl = require("./categoryController");
const NoteControl = require("./noteController");

/* métodos privados */
const ownerVerify = (owner, user) => {
    return owner === user;
};
/* método pra pegar todos os grupos que o usúario participa ou é dono */
exports.getAll = async (req, res, next) => {
    try {
        const query = Group.find({
            $or: [{
                    members: {
                        $in: [req.userId]
                    }
                },
                {
                    owner: req.userId
                }
            ]
        }).populate(["categories", "members"]);
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
                    isOwner: ownerVerify(group.owner, req.userId),
                    members: group.members.map(member => {
                        return {
                            id: member._id,
                            name: member.name,
                            email: member.email
                        };
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
        // await console.log(
        //     Group.findById(req.params.groupId)
        // );
        // console.clear()
        // console.log(req.params.groupId);
        // await Group.findOne({
        //     _id: req.params.groupId
        // }, (error, group) => {
        //     console.log(group);

        // })

        // console.log({
        //     _id: req.params.groupId
        // });

        const query = Group.findOne({
            $and: [

                {
                    _id: req.params.groupId
                },
                {
                    $or: [{
                            members: {
                                $in: [req.userId]
                            }
                        },
                        {
                            owner: req.userId
                        }
                    ]

                },


            ]

        }).populate(["members", "categories"]);
        query.exec(async (error, group) => {
            /* é retornado um erro caso o grupo não seja encontrado, esse erro é repassado ao usuário com um 404 . */
            // console.clear()
            // console.log(group);

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
                    isOwner: ownerVerify(group.owner, req.userId),
                    members: group.members.map(member => {
                        return {
                            id: member._id,
                            name: member.name,
                            email: member.email
                        };
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
        console.log(error);

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
                description
            } = req.body;
            description = description || "";
            Group.create({
                    name,
                    description,
                    owner: req.userId
                },
                async (error, group) => {
                    if (error)
                        return res.status(500).send({
                            error: "internal error, please try again."
                        });
                    else {
                        await UserControl.addIdGroupInUsers(
                            group.id, [req.userId]
                        );
                        const query = Group.findOne({
                            _id: group.id
                        }).populate(
                            "owner"
                        );
                        console.log(group);

                        query.exec((error, query_group) => {
                            if (query_group) {

                                console.log(query_group);

                                return res.send({
                                    id: query_group.id,
                                    name: query_group.name,
                                    description: query_group.description,
                                    isOwner: true,
                                    owner: {
                                        id: query_group.owner._id,
                                        name: query_group.owner.name,
                                        email: query_group.owner.email
                                    }
                                });
                            }
                        });
                    }
                }
            );
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
                description
            } = req.body;
            description = description || "";
            const grupo = await Group.findOne({
                _id: req.params.groupId,
                $or: [{
                        members: {
                            $in: [req.userId]
                        }
                    },
                    {
                        owner: req.userId
                    }
                ]
            }).populate("owner");
            if (!grupo){
                console.log(grupo)
                return res.status(404).send({
                    error: "Group Not Found."
                });
            }

            else {
                console.log(grupo.owner.id);

                if (ownerVerify(grupo.owner.id, req.userId)) {
                    Group.findOneAndUpdate({
                            _id: req.params.groupId,
                            $or: [{
                                    members: {
                                        $in: [req.userId]
                                    }
                                },
                                {
                                    owner: req.userId
                                }
                            ]
                        }, {
                            name,
                            description,
                            owner: req.userId
                        }, {
                            new: true
                        },
                        async (error, group) => {
                            if (!group) {
                                console.log(error);

                                return res.status(500).send({
                                    error: "internal error, please try again."
                                });
                            } else {
                                const query = Group.findById(group.id).populate(
                                    ["members", "owner"]
                                );
                                query.exec((error, query_group) => {
                                    if (query_group)
                                        return res.send({
                                            id: query_group.id,
                                            name: query_group.name,
                                            description: query_group.description,
                                            isOwner: true,
                                            owner: {
                                                id: query_group.owner._id,
                                                name: query_group.owner.name,
                                                email: query_group.owner.email
                                            },
                                            members: query_group.members.map(
                                                member => {
                                                    return {
                                                        id: member.id,
                                                        name: member.name,
                                                        email: member.email
                                                    };
                                                }
                                            )
                                        });
                                });
                            }
                        }
                    );
                } else {
                    return res.status(401).send({
                        error: "Você não esta autorizado a deletar este grupo, apenas o administrador pode deleta-lo."
                    });
                }
            }
        }
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        console.log(error);

        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

/* rota para deletar um groupo */
exports.delete = async (req, res, next) => {
    try {
        const group = await Group.findOne({
            _id: req.params.groupId,
            $or: [{
                    members: {
                        $in: [req.userId]
                    }
                },
                {
                    owner: req.userId
                }
            ]
        });
        if (!group)
            return res.status(410).send({
                error: "Group not found, please try again."
            });
        else {
            await UserControl.removeIdGroupInUsers(group.id, group.members);
            await CategoryControl.removeMore(group.categories, req.groupId);
            await NoteControl.removeMore(group.notes, req.groupId);
            Group.findOneAndRemove({
                    _id: req.params.groupId,
                    $or: [{
                            members: {
                                $in: [req.userId]
                            }
                        },
                        {
                            owner: req.userId
                        }
                    ]
                },
                (error, group) => {
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
                }
            );
        }
    } catch (error) {
        /* informa o usuário da api que houve um error interno no servidor */
        return res.status(500).send({
            error: "Internal  error, plaese try again."
        });
    }
};

/* método para adicionar a referência de uma tarefa a um grupo */
exports.addIdCategoryInGroup = async (groupId, categoryId) => {
    try {
        const group = await Group.findById(groupId);
        if (!group.categories.find(category => {
                return category === categoryId;
            })) {
            await group.categories.push(categoryId);
            let {
                name,
                description,
                members,
                categories,
                notes
            } = group;
            await Group.findByIdAndUpdate(groupId, {
                name,
                description,
                members,
                categories,
                notes
            });
        }
        return true;
    } catch (error) {
        return false;
    }
};

/* método para remover a referência de uma tarefa de um grupo */
exports.removeIdCategoryInGroup = async (groupId, categoryId) => {
    try {
        const group = await Group.findById(groupId);
        group.categories = group.categories.filter(category => {
            return category.toString() !== categoryId.toString();
        });
        let {
            name,
            description,
            members,
            categories,
            notes
        } = group;
        await Group.findByIdAndUpdate(groupId, {
            name,
            description,
            members,
            categories,
            notes
        });
        return true;
    } catch (error) {
        return false;
    }
};

/* método para adicionar a referência de uma tarefa a um grupo */
exports.addIdNoteInGroup = async (groupId, noteId) => {
    try {
        const group = await Group.findById(groupId);
        if (!group.notes.find(note => {
                return note === noteId;
            })) {
            await group.notes.push(noteId);
            let {
                name,
                description,
                members,
                categories,
                notes
            } = group;
            await Group.findByIdAndUpdate(groupId, {
                name,
                description,
                members,
                categories,
                notes
            });
        }
        return true;
    } catch (error) {
        return false;
    }
};

/* método para remover a referência de uma tarefa de um grupo */
exports.removeIdNoteInGroup = async (groupId, noteId) => {
    try {
        const group = await Group.findById(groupId);
        group.notes = group.notes.filter(note => {
            return note.toString() !== noteId.toString();
        });
        let {
            name,
            description,
            members,
            categories,
            notes
        } = group;
        await Group.findByIdAndUpdate(groupId, {
            name,
            description,
            members,
            categories,
            notes
        });
        return true;
    } catch (error) {
        return false;
    }
};


exports.removeGroup = async (groupId) => {
    try {
        console.log({
            grouId: groupId
        });
        Group.findOne({
            _id: groupId
        }, async (error, group) => {
            console.log(group);

            // await UserControl.removeIdGroupInUsers(group.id, group.members);
            await CategoryControl.removeMore(group.categories, groupId);
            await NoteControl.removeMore(group.notes, groupId);
            await Group.findOneAndRemove({
                _id: groupId
            })
            return true
        })
    } catch (error) {
        return false
    }
}