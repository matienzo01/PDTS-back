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

const createUser = async () => {

}

module.exports = {
    getAllInstitutionUsers,
    createUser
}