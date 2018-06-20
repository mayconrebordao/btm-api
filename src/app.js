const express = require("express");
const bp = require("body-parser");
const app = express();




app.use(bp.urlencoded({ extended: true }));
// usando body-parser para tranformar a requisição em objeto json
app.use(bp.json());


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization "
    );
    res.header('Access-Control-Allow-Methods', 'GET,PATCH, POST,DELETE,OPTIONS');
    res.header("Content-Type", " application/json; charset=utf-8")
    if (req.method === "OPTIONS") 
        res.send();
    else 
        next();
    // next();
});


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