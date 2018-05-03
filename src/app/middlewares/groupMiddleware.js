const Group = require('../models/Group')

// verificando se o grupo existe
exports.groupExists = async (req, res, next) =>{

	try{
		// tentando verificr se o grupo existe, caso exista o usuário procede em sua requisição
		Group.findById(req.params.groupId, (error, group) =>{
			if(group)next()
			else{
				return res.status(404).send({
					error: "Group Not Found, please check group Id and try again."
				})
			}
		})
	}
	catch(error){
		return res.status(500).send({
			error: "Internal server error, please try again."
		})
	}

}