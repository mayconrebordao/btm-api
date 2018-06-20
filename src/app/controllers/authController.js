const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authConfig = require("../../config/auth");
const crypto = require("crypto");

// função para gerar o token do usuário
const generateToken = (params = {}) => {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

exports.register = async (req, res, next) => {
    const {
        email,
        password
    } = req.body;
    // verificando se os campos de senha e email não estão vazios
    if (!email || !password) {
        return res.status(428).send({
            error: "Password and E-mail can not be null."
        });
    }

    // consulta para verificar se o usuário existe no sistema atraves do email
    let query = User.findOne({
        email
    }).select("+ password name email");
    query.exec(async (error, user) => {
        if (!user) {
            return res.status(404).send({
                error: "User not found."
            });
        }
        /* verificando se as senha que esta no sistema é compativel com a informada poeloo usuário */
        /*
        , (err, hash) =>{
            console.log({error: err, hash: hash})
        }
        */
        if (!(await bcrypt.compare(password, user.password))) {
            console.log(password)
            console.log("teste")
            return res.status(401).send({
                error: "Password not match."
            });
        }
            // console.log(user)
        return res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken({
                id: user._id
            })
        });
    });
};