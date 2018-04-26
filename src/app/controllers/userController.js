const User = require("../models/User");
const Group = require("../models/Group");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}


// rota para listar todos os usuários
exports.get = async (req, res, next) => {
  const query = User.findById(req.params.userId).populate("groupTask");
  query.exec(async (error, doc) => {
    if (doc) {
      const user = {
        id: doc._id,
        name: doc.name,
        email: doc.email,
        groups: doc.groupTask.map(group => {
          return {
            id: group._id,
            name: group.name,
            description: group.description
          };
        })
      };
      res.status(200).send({ user });
    } else res.status(404).send({ error: "User not found." });
  });

}


exports.post = async (req, res, next) => {
  try {
    const { email } = req.body;

    // console.log(req.body);
    // verificando se os dados de cadastro do usário não estão vazios
    if (!req.body.name || !req.body.password || !req.body.email) {
      return res.status(428).send({
        error: "Email, password or name  is null, but can not be null."
      });
    }

    // verificando se o email ja esta cadastrado no sistema, ou seja, se o usuário ja existe
    if (await User.findOne({ email })) {
      return res.status(409).send({
        error: "email is already in using!!"
      });
    }
    // criando usuário
    User.create(req.body, (error, user) => {
      // console.clear()
      // console.log(user)
      if (error) {
        return res.status(500).send({
          error: "Intenal error, please try again."
        });
      }
      const response = {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken({ id: user._id })
      };
      return res.status(200).send({
        response: response
      });
    });
  } catch (error) {
    // console.log(error)
    return res.status(500).send({
      error: "Registration failed, please tray again."
    });
  }
};

// Rota para atualizar usuários
exports.patch = async (req, res, next) => {
  const { name, password, email, nickname } = req.body;
  // console.clear()
  // console.log({ name, password, email, nickname })
  if (!name || !password || !email || !nickname) {
    return res.status(428).send({
      error: "Email, password, name or nickname is null, but can not be null."
    });
  }

  User.findByIdAndUpdate(
    req.params.userId,
    { name, password, email, nickname },
    { new: true },
    (error, user) => {
      // console.log(user)
      if (error)
        return res.status(500).send({
          error: "Internla error, please try again."
        });
      else
        return res.send({
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
    }
  );
};

exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByIdAndRemove(req.params.userId);
    if (!user) {
      return res.status(410).send({
        message: "Cannot delete user, because he's gone."
      });
    }
    const response = {
      message: "User delete successfull."
    };
    return res.status(202).send({ response: response });
  } catch (error) {
    return res.status(500).send({
      message: "Internal error.Cannot delete user, please Try again."
    });
  }
};
