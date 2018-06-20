const mongoose = require("mongoose");

let con = async (mongoose) => {
    try {
        console.log("teste");

        await mongoose.connect("mongodb://localhost/btm-api");
        mongoose.Promise = global.Promise;
    } catch (error) {
        // console.log(error);
        console.log("errro");

        try {
            // MLab
            await mongoose.connect("mongodb://r.maycon:mkdir0099@ds018268.mlab.com:18268/btm-api");
            // MongoDB Atlas
            // await mongoose.connect("mongodb+srv://rmaycon:mkdir0099@cluster0-dqrac.mongodb.net/btm-api");
            // await mongoose.connect("mongodb+srv://rmaycon:mkdir0099@cluster0-dqrac.mongodb.net/btm-api?retryWrites=true");
            mongoose.Promise = global.Promise;
        } catch (error) {
            // throw error
            return setTimeout(() => {
                return con(mongoose)
            }, 1000)
        }

    }
}
// con(mongoose)

const teste = async (mongoose) => {
    await mongoose.connect("mongodb://r.maycon:mkdir0099@ds018268.mlab.com:18268/btm-api");
    // await mongoose.connect("mongodb+srv://rmaycon:mkdir0099@cluster0-dqrac.mongodb.net/btm-api");
    // await mongoose.connect("mongodb://rmaycon:mkdir0099@cluster0.mongodb.net/btm-api-2");
    mongoose.Promise = global.Promise;

}
teste(mongoose)
module.exports = mongoose;