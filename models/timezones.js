const mongoose = require("mongoose")

const timezoneSchema = mongoose.Schema({
    timezone: {
	    type: String,
		required: true
	},
    user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	} 
}) 

timezoneSchema.set("toJSON",{
	transform: (document,returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

mongoose.set("useFindAndModify", false)

module.exports = mongoose.model("Timezone",timezoneSchema)