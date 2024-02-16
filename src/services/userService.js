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
    return {usuario: user[0]}
}

const createUser = async (newUser,institutionId) => {
    
    const user = await getUserByDni(newUser.dni)
    if (user !== undefined) {// existe un usuario con ese dni
        throw new Error('There is already a user with that DNI')
    }

    const institution_name = await knex('instituciones').select('nombre').where({id: institutionId})
    newUser.institucion_origen = Object.values(institution_name[0])[0]

    const insertId = await knex('evaluadores').insert(newUser)
    await linkUserToInstitution(newUser.dni,institutionId,insertId)
    return await getOneUser(insertId[0])
}

const getUserByDni = async (dni) => {
    const user = await knex('evaluadores').select().where({dni})
    return user[0]
}

const linkUserToInstitution = async(userDni, institutionId, userId = null) => {
    
    let evaluatorId = userId;
    let user

    if (!evaluatorId) {
        user = await getUserByDni(userDni);
        if (!user) {
            const _error = new Error('There is no user with the provided DNI');
            _error.status = 404
            throw _error
        }
        evaluatorId = user.id;
    }

    try {
        await knex('evaluadores_x_instituciones')
        .insert({ id_institucion: institutionId, id_evaluador: evaluatorId });
    } catch (error) {
        const _error = new Error('The user is already linked to the institution')
        _error.status = 409
        throw _error
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