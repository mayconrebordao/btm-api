const Group = require("../models/Group");

exports.getById = async (req, res, next) => {
    try {
        Group.findById(req.params.groupId, async (error, group) => {
            // é retornado um erro caso o grupo não seja encontrado, esse erro é repassado ao usuário com um 404 .
            if (error) {
                return res.status(404).send({ error: "Group Not found." });
            }
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
            return res.status(428).send({ error: "Name cannot be null. " });
        else {
            const { name, description } = req.body;
            Group.create({ name, description }, (error, group) => {
                if (error)
                    return res.status(500).send({
                        error: "internal error, please try again."
                    });
                else
                    return res.send({
                        id: group.id,
                        name: group.name,
                        description: group.description
                    });
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
            return res.status(428).send({ error: "Name cannot be null. " });
        else {
            const { name, description } = req.body;
            Group.findByIdAndUpdate(
                req.params.groupId,
                { name, description },
                { new: true },
                (error, group) => {
                    // caso haja erro, o usuário não foi encontrado, é retornado um 404 indicando esse erro.
                    if (error)
                        return res.status(404).send({
                            error: "Group not found, please try again."
                        });
                    // caso contrário os dados atualizados do usuário são retornados.
                    else
                        return res.send({
                            id: group.id,
                            name: group.name,
                            description: group.description
                        });
                }
            );
        }
    } catch (error) {
        // informa o usuário da api que houve um error interno no servidor
        return res
            .status(500)
            .send({ error: "Internal  error, plaese try again." });
    }
};

// rota para deletar um groupo
exports.delete = async (req, res, next) => {
    try {
        Group.findByIdAndRemove(req.params.groupId, (error, group) => {
            // verificando se o grupo foi encontrado, caso não seja encontrado significa que o grupo não existe mais ou nunca existiu, por isso é retornado um 410.
            if (error)
                return res.status(410).send({
                    error: "Group not found, please try again."
                });
            // caso não esta erro,  ele foi deletado com sucesso, é retornado uma messagem e um 202.
            else
                return res.status(202).send({
                    message: "User delete Successfull"
                });
        });
    } catch (error) {
        // informa o usuário da api que houve um error interno no servidor
        return res
            .status(500)
            .send({ error: "Internal  error, plaese try again." });
    }
};
