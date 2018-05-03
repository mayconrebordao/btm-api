const express = require("express");
const bp = require("body-parser");
const app = express();

// usando body-parser para tranformar a requisição em objeto json
app.use(bp.json());
require("./app/routes/")(app);

// bloco que trata a resposta quando o usuário não encontra nenhuma rota disponivel
app.use((req, res, next) => {
    const error = new Error("Resource Not Found!");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: error.status + "! " + error.message
    });
});

module.exports = app;
