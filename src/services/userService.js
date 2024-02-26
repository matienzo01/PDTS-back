const knex = require('../database/knex')
const bcrypt = require('bcrypt')
const mailer = require('./mailer')

const getAllInstitutionUsers = async (id_institucion) => {

  const ids = await knex('evaluadores_x_instituciones')
    .select('id_evaluador')
    .where({ id_institucion: id_institucion })

  const arrayIds = ids.map(row => row.id_evaluador);
  const users = await knex('evaluadores')
    .whereIn('id', arrayIds)

  users.forEach(user => {
    delete user.password
  });

  return { users: users }
}

const getOneUser = async (id) => {
  const user = await knex('evaluadores').select().where({ id }).first()

  if (!user) {
    const _error = new Error('There is no user with the provided id')
    _error.status = 404
    throw _error
  }
  const { password, ...returnedData } = user
  return { usuario: returnedData }
}

const createHash = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

const createUser = async (newUser, institutionId) => {

  try {
    await getUserByDni(newUser.dni) // debe dar un 404 para asegurarnos de que no exista previamente el usuario
    const _error = new Error('There is already a user with that DNI')
    _error.status = 409
    throw _error
  } catch (error) {
    if (error.status !== 404) {
      throw error
    }
  }
  const oldpass = newUser.password
  newUser.password = await createHash(oldpass)
  const insertId = await knex('evaluadores').insert(newUser)
  userId = insertId[0]
  await linkUserToInstitution(newUser.dni, institutionId, insertId)
  //mailer.sendNewUser(newUser, oldpass)
  return await getOneUser(userId)
}

const getUserByDni = async (dni) => {
  const user = await knex('evaluadores').select().where({ dni }).first()

  if (!user) {
    const _error = new Error('There is no user with the provided dni')
    _error.status = 404
    throw _error
  }
  delete user.password
  return user
}

const linkUserToInstitution = async (userDni, institutionId, userId = null) => {
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
    console.log(error);
    if (error.code === 'ER_DUP_ENTRY') {
      const _error = new Error('The user is already linked to the institution')
      _error.status = 409
      throw _error
    } else {
      throw error
    }
  }

  if (!userId)
    return { usuario: user }
}

module.exports = {
  getAllInstitutionUsers,
  getUserByDni,
  createUser,
  linkUserToInstitution
}