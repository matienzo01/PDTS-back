const bcrypt = require('bcrypt')
const knex = require('../database/knex')
const jwt = require('jsonwebtoken')

const login = async (mail, password) => {

  const tablesToCheck = [
    { rol: 'admin general', tableName: 'admin', columns: ['email', 'password'] },
    { rol: 'admin', tableName: 'admins_cyt', columns: ['id', 'email', 'password'] },
    { rol: 'evaluador', tableName: 'evaluadores', columns: ['id', 'email', 'password', 'nombre', 'apellido'] }
  ];

  let user = null;

  for (const table of tablesToCheck) {
    user = await knex(table.tableName).select(...table.columns).where({ email: mail }).first();
    if (user) {
      user.rol = table.rol
      if (table.tableName === 'admin') {
        user.id = 1;
      } else if (table.tableName === 'admins_cyt') {
        user.institutionId = (await knex('instituciones_cyt').select('id').where({ id_admin: user.id }).first()).id
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
    mail: user.email,
    rol: user.rol,
    institutionId: user.institutionId,
    nombre: user.nombre,
    apellido: user.apellido
  }

  console.log('userForToken', userForToken);

  const token = jwt.sign(userForToken, process.env.SECRET || 'clave')
  return { token: token, user: userForToken }
}

module.exports = {
  login
}