const Category = require('../models/Category')
const GroupControl = require('./groupController')
const utils = require('./utils')

exports.getAll = async (req, res, next) => {
    try {
        const query = Category.find({
            belongs_to: req.groupId
        }).populate(['belongs_to', 'tasks'])
        query.exec(async (error, categories) => {
            if (categories && categories.length !== 0)
                return res.send(categories)
            else
                return res.status(404).send({
                    error: "No categories found."
                })
        })
        // return res.send()
    } catch (error) {
        return utils.ServerError(res)

    }
}

exports.getById = async (req, res, next) => {
    try {
        const query = Category.findOne({
            _id: req.params.categoryId,
            belongs_to: req.groupId
        }).populate(['belongs_to', 'tasks'])
        query.exec(async (error, category) => {
            if (category)
                return res.send(category)
            else
                return res.status(404).send({
                    error: "Category not found."
                })
        })
    } catch (error) {
        return utils.ServerError(res)
    }
    // return res.send()
}

exports.create = async (req, res, next) => {
    try {
        let {
            name,
            description
        } = req.body
        if (!name)
            return res.status(428).send({
                error: "Name cannot be null."
            })
        else {
            description = description || ""
            console.log(req.groupId);

            Category.create({
                name,
                description,
                belongs_to: req.groupId
            }, async (error, category) => {
                if (category) {
                    await GroupControl.addIdCategoryInGroup(req.groupId, category._id)
                    return res.send(category)
                } else {
                    console.log(error);

                    throw error
                }
            })
        }
    } catch (error) {
        console.log(error.code);


        return utils.ServerError(res)
    }
}

exports.update = async (req, res, next) => {
    try {
        const tmp = await Category.findOne({
            belongs_to: req.groupId,
            _id: req.params.categoryId
        }).select('tasks')

        let {
            name,
            description
        } = req.body

        if (!name)
            return res.status(428).send({
                error: "Name cannot be null."
            })
        else {

            const query = Category.findByIdAndUpdate({
                _id: req.params.categoryId,
                belongs_to: req.groupId
            }, {
                new: true,
            }, async (error, category) => {
                if (category) {
                    const cat = Category.findById(category._id).populate(['tasks', 'belongs_to'])
                    cat.exec(async (error, category) => {
                        if (category) {
                            return res.send(category)
                        } else throw error
                    })
                    // return res.send(category)
                } else {
                    return res.status(404).send({
                        error: "category not found"
                    })

                }
            })
            query.exec()
        }



    } catch (error) {
        console.log(error.name);

        return utils.ServerError(res)
    }
}

exports.remove = async (req, res, next) => {
    try {
        // await
        if (await Category.findOne({
                _id: req.params.categoryId,
                belongs_to: req.groupId
            })) {
            Category.findOneAndRemove({
                _id: req.params.categoryId,
                belongs_to: req.groupId
            }, async (error) => {
                if (!error) {
                    await GroupControl.removeIdCategoryInGroup(req.groupId, req.params.categoryId)
                    return res.send({
                        msg: "Category delete successfull."
                    })
                }
            })
        } else {
            return res.status(404).send({
                errror: "Category not found"
            })
        }
    } catch (error) {
        return utils.ServerError(res)
    }
}




exports.addIdTaskInCategory = async (categoryId, taskId) => {
    try {
        const category = await Category.findById(categoryId)
        if (!category.tasks.find(task => {
                return task === taskId
            })) {
            await category.tasks.push(taskId)
            let {
                name,
                description,
                tasks
            } = category
            await Category.findByIdAndUpdate(categoryId, {
                name,
                description,
                tasks
            })
        }
        return true

    } catch (error) {
        return false
    }
}







exports.removeIdTaskInCategory = async (categoryId, taskId) => {
    try {
        const category = await Category.findById(categoryId)
        category.tasks = category.tasks.filter(task => {
            return task.toString() !== taskId.toString()
        })
        let {
            name,
            description,
            tasks
        } = category
        await Category.findByIdAndUpdate(categoryId, {
            name,
            description,
            tasks
        })
        return true
    } catch (error) {
        return false
    }
}