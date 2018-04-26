const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');


module.exports = (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res
          .status(401)
          .send({
            error: "The request has not been applied because it lacks valid authentication credentials for the target resource. No token provided."
          });
    }
    
    const parts = authHeader.split(' ');

    if(!parts.length ===2){
        return res
          .status(412)
          .send({
            error:
              "One or more conditions given in the request header fields evaluated to false when tested on the server. Token format invalid or Token not fount in headers."
          });
    }

    const [ scheme, token ] = parts;

    if(!/^Bearer$/i.test(scheme)){
        return res.status(412).send({ error:  "One or more conditions given in the request header fields evaluated to false when tested on the server. Token format invalid." });
    }

    jwt.verify(token, authConfig.secret, (error, decoded) => {
        if(error){
            return res.status(412).send({ error: "One or more conditions given in the request header fields evaluated to false when tested on the server. Token invalid or token not fund in headers." });           
        }
        req.userId = decoded.id;
        return next();
    });

};