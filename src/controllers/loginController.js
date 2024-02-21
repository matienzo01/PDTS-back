const service = require('../services/loginService.js')

const login = async (req,res) => {
    const { mail, password } = req.body

    try {
        res.status(200).json(await service.login(mail,password))
    } catch (error) {
        const statusCode = error.status || 500
        res.status(statusCode).json({ error: error.message })
    }
}

module.exports = {
    login
}