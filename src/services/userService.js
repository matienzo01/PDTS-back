const knex = require('../database/knex')

const getAllInstitutionUsers = async (id_institucion) => {

    const ids = await knex('evaluadores_x_instituciones')
            .select('id_evaluador')
            .where({id_institucion: id_institucion})
        
    const arrayIds = ids.map(row => row.id_evaluador);
    const users = await knex('evaluadores')
            .whereIn('id',arrayIds)
    
    users.forEach(user => {
        delete user.password
    });

    return {users: users}
}

const getOneUser = async(id) => {
    const user = await knex('evaluadores').select().where({id})

    if (!user[0]) {
        const _error = new Error('There is no user with the provided id')
        _error.status = 404
        throw _error
    }

    return {usuario: user[0]}
}

const createUser = async (newUser,institutionId) => {
    
    try {
        const user = await getUserByDni(newUser.dni) //si no existe, va a tirar un 404. por lo que si pasa
                                                      //de esta linea ya existe un usuario con ese dni
        const _error = new Error('There is already a user with that DNI')
        _error.status = 409
        throw _error
    } catch (error) {
        if (error.status !== 404) {
            throw error
        }
    }

    /*
    const institution_name = await knex('instituciones').select('nombre').where({id: institutionId})
    console.log(institution_name)
    newUser.institucion_origen = Object.values(institution_name[0])[0]*/

    const insertId = await knex('evaluadores').insert(newUser)
    await linkUserToInstitution(newUser.dni,institutionId,insertId)
    return await getOneUser(insertId[0])
}

const getUserByDni = async (dni) => {
    const user = await knex('evaluadores').select().where({dni})

    if (!user[0]) {
        const _error = new Error('There is no user with the provided dni')
        _error.status = 404
        throw _error
    }

    return user[0]
}

const linkUserToInstitution = async(userDni, institutionId, userId = null) => {
    let evaluatorId = userId;
    let user

    if (!evaluatorId) {
        user = await getUserByDni(userDni);
        evaluatorId = user.id;
    }

    try {
        await knex('evaluadores_x_instituciones')
        .insert({ id_institucion: institutionId, id_evaluador: evaluatorId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const _error = new Error('The user is already linked to the institution')
            _error.status = 409
            throw _error
        } else {
            throw error
        }
    }
    
    if (!userId)
        return {usuario: user}
}

module.exports = {
    getAllInstitutionUsers,
    getUserByDni,
    createUser,
    linkUserToInstitution
}