### Rotas da API

rotas /

    User:

        get /users/ // listar todos os usuários
        get /users/:userId // lista apenas um usuário
        post /users/ // criar um usuário
        patch /users/:userId // atualizar um usuário
        delete /users/:userId // deletar um usuário

    Group:

        get /groups/ listar todos os grupos
        get /groups/:groupId // viazualizar apenas um grupo
        post /groups/ // criar um grupo
        patch /groups/:groupId // atualizar um grupo
        delete /groups/:groupId // deletar um grupo

        Group Tasks:
            get /groups/:groupId/tasks/         //  Listar todas as tarefas do grupo
            get /groups/:groupId/tasks/:taskId          //  Ver uma tarefa especifica do grupo
            post /groups/:groupId/tasks/            //  Criar uma tarefa no grupo
            patch /groups/:groupId/tasks/:taskId            //  Atualizar uma tarefa no grupo
            delete /groups/:groupId/tasks/:taskId           //  deletar uma tarefa no grupo
