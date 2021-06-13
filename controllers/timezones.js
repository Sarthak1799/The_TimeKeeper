const { request, response } = require('express')
const timezoneRouter = require('express').Router()
const Timezone = require("../models/timezones")
const User = require("../models/user")
const jwt = require('jsonwebtoken')
const { DateTime } = require("luxon")


timezoneRouter.get('/:username/zones', async (request,response) => {
    const token = request.token
    const decodedToken = jwt.verify(token,process.env.JWT_KEY)
	if(!token || !decodedToken){
		return response.status(401).json({
			error: "token missing or invalid"
		})
	}
    const user = await User.findOne({ username: request.params.username})
    if(decodedToken.id !== user.id){
        return response.status(403).json({
            error: "Forbidden"
        })
    }
    const zones = await Timezone.find({ user: decodedToken.id}).populate("user",{ username:1, name:1 })
    let zoneArr = zones.map(zone => DateTime.local().setZone(zone.timezone).toString())
    response.json(zones)
})

timezoneRouter.get('/:username/zones/:zoneId', async (request,response) => {
    const token = request.token
    const decodedToken = jwt.verify(token,process.env.JWT_KEY)
	if(!token || !decodedToken){
		return response.status(401).json({
			error: "token missing or invalid"
		})
	}
    const user = await User.findOne({ username: request.params.username})
    if(decodedToken.id !== user.id){
        return response.status(403).json({
            error: "Forbidden"
        })
    }
    const id = request.params.zoneId
    const zone = await Timezone.findById(id)
    if(!zone) {
        return response.status(404).json({ error: "Not Found"})
    }
    response.json(zone)
})

timezoneRouter.post('/:username/zones', async (request, response) => {
    const body = request.body
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.JWT_KEY)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
  }

    const user = await User.findById(decodedToken.id)

    if(!body.timezone) {
        return response.status(400).json({ error: "something is missing" })
    }

    const zone = new Timezone({
		timezone: body.timezone,
        user: user._id
	})

	const savedzone = await zone.save()
    user.timezones = user.timezones.concat(savedzone._id)
    await user.save()

	response.status(201).json(savedzone)
})

timezoneRouter.delete('/:username/zones/:zoneId', async (request,response) => {
    const token = request.token
    const decodedToken = jwt.verify(token,process.env.JWT_KEY)
	if(!token || !decodedToken){
		return response.status(401).json({
			error: "token missing or invalid"
		})
	}

    const id = request.params.zoneId
    const user = await User.findOne({ username: request.params.username})
    const tzone = await Timezone.findById(id)
    console.log(tzone.user)

    if (tzone.user.toString() === decodedToken.id) {
        await Timezone.findByIdAndDelete(id)
        await User.updateOne( { _id: user._id}, { $pull: {timezones: id}})
        response.status(204).end()
    } else {
        return response.status(401).json({error: "Unauthorized to access the timezone"})
    }
     
})

module.exports = timezoneRouter

