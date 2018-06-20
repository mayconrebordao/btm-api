const mongoose = require("../../database");

const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    invitations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }],
    last_update: {
        type: Date
    }
});

// UserSchema.pre("findOneAndUpdate", async function (next) {
//     console.log('update')
//     const hash = await bcrypt.hash(this.password, 10);
//     this.password = hash;
//     next();
// });


// UserSchema.pre('findOneAndUpdate', function(next) {
//     const encryptPassword = async (password) =>{
//         const hash = await bcrypt.hash(password, 10);
//         return hash;
//     }
//     this.findOneAndUpdate({}, { password: encryptPassword(this.getUpdate().$set.password) });
//     next();
// });



// This is the important bit
// Using a virtual lets me pass `{ password: 'xyz' }` 
// without actually having it save.
// Instead it is caught by this setter 
// which performs the hashing and 
// saves the hash to the document's hash property.
// UserSchema.virtual('hash').set(function(value) {
//   const salt = bcrypt.genSaltSync(10)
//   this.password = bcrypt.hashSync(value, salt)
// })

// // A method for checking the password
// UserSchema.methods.comparePassword = function(password) {
//   return bcrypt.compareSync(password, this.password)
// }

// // Here I make sure I never return the
// // password in the JSON representation
// // Note that I don't do the same to
// // `toObject` so i can still see the hash
// // in, say, the console.
// UserSchema.set('toJSON', {
//   getters: true,
//   transform: (doc, ret, options) => {
//     delete ret.password;
//     return ret;
//   }
// })

UserSchema.pre('findOneAndUpdate', async function (next) {
    // this.setOptions({
    //   new: true,
    //   runValidators: true
    // });
    let data = await User.findOne({
        _id: this.getUpdate().user_id
    }).select('password')
    console.log(data);

    // console.log({user: data.password})
    // console.log("update")
    // console.log(this.getUpdate())
    console.log({
        this: this.getUpdate().password,
        data: data.password
    });

    if (this.getUpdate().password != data.password) {
        // console.log('update')
        this.update({}, {
            last_update: Date().toString(),
            password: await bcrypt.hash(this.getUpdate().password, 10),
        });
    }
    // console.log(this.last_update)
    // console.log("update")
    // console.log(this.getUpdate().password)
    next();
});



UserSchema.pre("save", async function (next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});


const User = mongoose.model("User", UserSchema);

module.exports = User;