const gen_consulta = require('../database/gen_consulta')

const getAllInstitutionUsers = async (id_institucion) => {

    const table = 'evaluadores_x_instituciones'
    const conds = [`id_institucion = ${id_institucion}`]
    const columns = '(id_evaluador)'

    try {
        const ids = await gen_consulta._select(table,columns,conds)
        
        const idsString = ids.map(row => row.id_evaluador);
        const conds2 = [`id IN (${idsString.join(',')})`];
        const users = await gen_consulta._select('evaluadores',null,conds2)
        users.forEach(user => {
            delete user.password
        });

        return {users: users}
    } catch(error) {
        throw error;
    }

}



const createUser = async (newUser,institutionId) => {
    
    try {
        const user = await getUserByDni(newUser.dni)
        if (user !== undefined) {// existe un usuario con ese dni
            throw new Error('There is already a user with that DNI')
        }
        const table1 = 'evaluadores(email,nombre,apellido,dni,celular,especialidad,institucion_origen,pais_residencia,provincia_residencia,localidad_residencia)'
        const insertData = await gen_consulta._insert(table1,Object.values(newUser))
        return await linkUserToInstitution(newUser.dni,institutionId)

    } catch(error){
        throw new Error(error.message)
    }
}

const getUserByDni = async (dni) => {
    try {
        const user = await gen_consulta._select('evaluadores',null,[`dni = ${dni}`])
        return user[0]
    } catch(error) {
        throw error
    }
}

const linkUserToInstitution = async(userDni, institutionId) => {
    
    const table = 'evaluadores_x_instituciones(id_institucion,id_evaluador)'
    const user = await getUserByDni(userDni)
    
    if (user === undefined) {
        throw new Error('There is no user with the provided DNI');
    }

    try {
        return await gen_consulta._insert(table,[institutionId,user.id])
    } catch(error) {
        throw error
    }
}

module.exports = {
    getAllInstitutionUsers,
    createUser,
    linkUserToInstitution
}