exports.ServerError = async (res) => {
    return res.status(500).send({
        error: "Internal server error, plese try again."
    })
}