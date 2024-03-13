const service = require('../services/loginService.js')

const login = async (req,res) => {
    const { mail, password } = req.body

    if (!mail || !password) {
        return res.status(400).json({ error: 'mail or passord missing'})
    }

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