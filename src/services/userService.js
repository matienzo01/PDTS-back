const knex = require('../database/knex')
const bcrypt = require('bcrypt')
const mailer = require('./mailer')
const TABLE_EVALUADORES = 'evaluadores'
const institutuionService = require('./institutionCYTService')

const getAllUsers = async () => {
  const users = await knex(TABLE_EVALUADORES).select()
  const participaEn = (await knex.raw('CALL obtener_instituciones_de_usuario'))[0][0]

  const institucionesPorIdUsuario = participaEn.reduce((obj, inst) => {
    const id = inst.id;
    const participantes = JSON.parse(inst.participa_en); // Convertimos la cadena '[1]' a un array [1]
    obj[id] = participantes;
    return obj;
  }, {});

  const usuarios = users.map(user => {
      const { password, ...rest } = user
      rest.participaEn = institucionesPorIdUsuario[user.id] ? institucionesPorIdUsuario[user.id] : []
      return rest
    }
  )

  return { usuarios: usuarios }
}

const getAllInstitutionUsers = async (id_institucion) => {
  if (await knex('instituciones_cyt').select().where({ id: id_institucion }).first() === undefined) {
    const _error = new Error('There is no institution with the provided id')
    _error.status = 404
    throw _error
  }

  const ids = await knex('evaluadores_x_instituciones')
    .select('id_evaluador')
    .where({ id_institucion: id_institucion })

  const arrayIds = ids.map(row => row.id_evaluador);
  const users = await knex(TABLE_EVALUADORES)
    .whereIn('id', arrayIds)

  users.forEach(user => {
    delete user.password
  });

  return { users: users }
}

const getOneUser = async (id, trx = null) => {
  const queryBuilder = trx || knex
  const user = await queryBuilder(TABLE_EVALUADORES).select().where({ id }).first()

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
  await institutuionService.getOneInstitucionCYT(institutionId)

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

  await mailer.checkEmail(newUser.email)

  return await knex.transaction(async (trx) => {
    const oldpass = newUser.password
    newUser.password = await createHash(oldpass)
    const insertId = (await trx(TABLE_EVALUADORES).insert(newUser))[0]
    await linkUserToInstitution(newUser.dni, institutionId, insertId, trx)
    //mailer.sendNewUser(newUser, oldpass)
    return await getOneUser(insertId, trx)
  })

}

const getUserByDni = async (dni) => {
  const user = await knex(TABLE_EVALUADORES).select().where({ dni }).first()

  if (!user) {
    const _error = new Error('There is no user with the provided dni')
    _error.status = 404
    throw _error
  }
  delete user.password
  return user
}

const linkUserToInstitution = async (userDni, institutionId, userId = null, trx = null) => {
  const queryBuilder = trx || knex
  let evaluatorId = userId;
  let user

  if (!evaluatorId) {
    user = await getUserByDni(userDni);
    evaluatorId = user.id;
  }

  try {
    const { institucion_CYT } = await institutuionService.getOneInstitucionCYT(institutionId)
    await queryBuilder('evaluadores_x_instituciones')
      .insert({ id_institucion: institutionId, id_evaluador: evaluatorId });
    if (!trx) {
      //mailer.linkUser(user)
    }
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
    return { usuario: user }
}

const updateUser = async (id, user) => {
  await knex(TABLE_EVALUADORES).where({ id: id }).update(user)
  return await getOneUser(id)
}

module.exports = {
  getAllUsers,
  getAllInstitutionUsers,
  getUserByDni,
  createUser,
  linkUserToInstitution,
  updateUser
}