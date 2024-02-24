const bcrypt = require('bcrypt')
const knex = require('../database/knex')
const jwt = require('jsonwebtoken')

const login = async (mail,password) => {
    
    const tablesToCheck = [
        { tableName: 'admin', columns: ['email', 'password'] },
        { tableName: 'admins_cyt', columns: ['id', 'email', 'password'] },
        { tableName: 'evaluadores', columns: ['id', 'email', 'password'] }
    ];
    
    let user = null;
    
    for (const table of tablesToCheck) {
        user = await knex(table.tableName).select(...table.columns).where({ email: mail }).first();
        if (user) {
            console.log(table.tableName)
            if (table.tableName === 'admin') {
                user.id = 1;
            }
            break;
        }
    }

    const passwordCorrect = user === undefined
        ? false
        : await bcrypt.compare(password, user.password)
    
    delete user.password
    if (!(user && passwordCorrect)) {
        const _error = new Error('Invalid user or password')
        _error.status = 401
        throw _error
    }

    const userForToken = {
        id: user.id,
        mail: user.email
    }

    const token = jwt.sign(userForToken, process.env.SECRET || 'clave')
    return { token: token}
}

module.exports = {
    login
}