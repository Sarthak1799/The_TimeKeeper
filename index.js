const app = require("./app")
const logger = require("./utils/logger")
const config = require("./utils/config")

app.listen(config.PORT || 3001, () => {
	logger.info(`Server running on port ${config.PORT}`)
})

