const bcrypt = require('bcrypt')
const { request } = require('../app')
const userRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')

function signupValidation(body){
	const password = body.password
	const username = body.username

	if(password === undefined || username === undefined){
		return "Username or Password missing"
	}
	else if(password.length < 3){
		return "Password must be atleast 3 characters long"
	}
	else if(username.length <3){
		return "Username must be atleast 3 characters long"
	}
	return undefined
}

userRouter.get("/", async (req,res) => {
	const users = await User.find({}).populate("timezones",{ timezone: 1})
	return res.json(users)
})

userRouter.get("/:username", async (req,res) => {
	const token = req.token
    const decodedToken = jwt.verify(token,process.env.JWT_KEY)
	if(!token || !decodedToken){
		return res.status(401).json({
			error: "token missing or invalid"
		})
	}
	const user = await User.findOne({username: req.params.username})
	if(!user) {
        return res.status(404).json({ error: "User Not Found"})
    }
    if(decodedToken.id !== user.id){
        return res.status(403).json({
            error: "Forbidden"
        })
    }
    
    res.json(user)
})

userRouter.post("/signup", async (req,res) => {
	const body = req.body

	const validationMessage = signupValidation(body)
	if(validationMessage){
		return res.status(400).send({ error: validationMessage })
	}

	const salt = 10
	const passwordHash  = await bcrypt.hash(body.password,salt)

	const user = new User({
		name: body.name,
		username: body.username,
		passwordHash
	})

	const savedUser = await user.save()

	return res.status(201).json(savedUser)
})

module.exports = userRouter