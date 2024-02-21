const bcrypt = require('bcrypt')
const knex = require('../database/knex')
const jwt = require('jsonwebtoken')

const login = async (mail,password) => {

    const user = await knex('evaluadores').select('id','email','password').where({email: mail})
    const passwordCorrect = user[0] === undefined
        ? false
        : await bcrypt.compare(password, user[0].password)
    
    delete user[0].password
    if (!(user[0] && passwordCorrect)) {
        const _error = new Error('Invalid user or password')
        _error.status = 401
        throw _error
    }

    const userForToken = {
        id: user[0].id,
        mail: user[0].email
    }

    const token = jwt.sign(userForToken, process.env.SECRET || '1234')
    return { token: token}
}

module.exports = {
    login
}