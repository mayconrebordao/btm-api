const Category = require('../models/Category')

// verificando se o grupo existe
exports.categoryExists = async (req, res, next) => {

    try {
        /* tentando verificr se o grupo existe, caso exista o usuário procede em sua requisição */
        Category.findById(req.params.categoryId, (error, category) => {
            // return next()

            if (category) {
                // console.log('teste');

                req.categoryId = req.params.categoryId
                return next()
            } else {
                return res.status(404).send({
                    error: "Category Not Found, please check category Id and try again."
                })
            }
        })
    } catch (error) {
        return res.status(500).send({
            error: "Internal server error, please try again."
        })
    }

}