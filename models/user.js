const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = mongoose.Schema({
	username: {
		type: String,
		unique: true
	},
	name: String,
	passwordHash: String,
    timezones : [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Timezone"
	}]
})

userSchema.set("toJSON",{
	transform: (document,returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		delete returnedObject.passwordHash
	}
})

mongoose.plugin(uniqueValidator)
module.exports = mongoose.model("User",userSchema)