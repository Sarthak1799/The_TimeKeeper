const logger = require("./logger")

const requestLogger = (request, response, next) => {
	logger.info('Method:', request.method)
	logger.info('Path:  ', request.path)
	logger.info('Body:  ', request.body)
	logger.info('---')
	next()
  }

const unknownEndpoint = (req,res) => {
	res.status(404).send({ error:"unkown endpoint" })
}

const errorHandler = (error,req,res,next) => {
	logger.error(error.message)
	if (error.name === "CastError") {
		return res.status(400).send({ error: "malformatted id" })
	} else if (error.name === "ValidationError") {
		return res.status(400).json({ error: error.message })
	} else if(error.name === "JsonWebTokenError") {
		return res.status(401).json({ error: error.message })
	} else if (error.name === 'TokenExpiredError') {
		return res.status(401).json({
		  error: 'token expired'
		})
	  }
	logger.error(error)
	next(error)
}

const tokenExtractor = ((request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
	  request.token = authorization.slice(7)
	  return next()
	}
	request.token = null
	return next()
  })

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor
}