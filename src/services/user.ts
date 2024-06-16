import { Evaluador } from "../types/Evaluador"
import { CustomError } from "../types/CustomError"
import knex from '../database/knex'
import bcrypt from 'bcrypt'
import mailer from './mailer'
const TABLE_EVALUADORES = 'evaluadores'
import institutuionService from './institutionCYT'

const getAllAdmins = async() => {
  const admins = await knex('admins_cyt as a')
    .join('instituciones_cyt as icyt','icyt.id_admin','a.id')
    .join('instituciones as i','i.id','icyt.id')
    .select(
      'a.nombre as nombre',
      'a.apellido as apellido',
      'a.email as email',
      'a.dni as dni',
      'a.id',
      'i.id as institutionId',
      'i.nombre as nombre_institucion',
      'icyt.nombre_referente as nombre_referente_institucion',
      'icyt.apellido_referente as apellido_referente_institucion',
      'icyt.cargo_referente as cargo_referente_institucion',
      'icyt.telefono_referente as telefono_referente_institucion',
      'icyt.mail_referente as mail_referente_institucion',
      'i.pais as pais_institucion',
      'i.provincia as provincia_institucion',
      'i.localidad as localidad_institucion',
      'telefono_institucional',
      'mail_institucional'
      )

  return { administradores: admins}
}

const getAllEvaluadores = async () => {
  const users = await knex(TABLE_EVALUADORES).select()
  const participaEn = (await knex.raw('CALL obtener_instituciones_de_usuario'))[0][0]

  const institucionesPorIdUsuario = participaEn.reduce((obj: any, inst: any) => {
    const id = inst.id;
    const participantes = JSON.parse(inst.participa_en); // Convertimos la cadena '[1]' a un array [1]
    obj[id] = participantes;
    return obj;
  }, {});

  const usuarios = users.map((user: any) => {
      const { password, ...rest } = user
      rest.participaEn = institucionesPorIdUsuario[user.id] ? institucionesPorIdUsuario[user.id] : []
      return rest
    }
  )

  return { evaluadores: usuarios }
}

const getAllInstitutionUsers = async (id_institucion: number) => {
  if (await knex('instituciones_cyt').select().where({ id: id_institucion }).first() === undefined) {
    throw new CustomError('There is no institution with the provided id', 404)
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

const getOneUser = async (id: number, trx: any = null) => {
  const queryBuilder = trx || knex
  const user = await queryBuilder(TABLE_EVALUADORES).select().where({ id }).first()

  if (!user) {
    throw new CustomError('There is no user with the provided id', 404)
  }
  const { password, ...returnedData } = user
  return { usuario: returnedData }
}

const getOneAdmin = async(id: number) => {
  const user = await knex('admins_cyt').select().where({ id }).first()

  if (!user) {
    throw new CustomError('There is no user with the provided id', 404)
  }
  console.log(user)
  const { password, ...returnedData } = user
  return { admin: returnedData }
}

const createHash = async (password: string) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err: Error | undefined, hash: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

const createUser = async (newUser: any, institutionId: number) => {
  await institutuionService.getOneInstitucionCYT(institutionId)

  try {
    await getUserByDni(newUser.dni) // debe dar un 404 para asegurarnos de que no exista previamente el usuario
    throw new CustomError('There is already a user with that DNI', 409)
  } catch (error) {
    if ((error as CustomError).status !== 404) {
      throw error
    }
  }

  await mailer.checkEmail(newUser.email)

  return await knex.transaction(async (trx) => {
    const oldpass = newUser.dni
    newUser.password = await createHash(oldpass)
    const insertId = (await trx(TABLE_EVALUADORES).insert(newUser))[0]
    await linkUserToInstitution(newUser.dni, institutionId, insertId, trx)
    mailer.sendNewUser(newUser)
    return await getOneUser(insertId, trx)
  })

}

const getUserByDni = async (dni: number) => {
  const user = await knex(TABLE_EVALUADORES).select().where({ dni }).first()

  if (!user) {
    throw new CustomError('There is no user with the provided dni', 404)
  }
  delete user.password
  return user
}

const linkUserToInstitution = async (userDni: number, institutionId: number, userId: number | null = null, trx: any = null) => {
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
      mailer.linkUser(user, institucion_CYT)
    }
  } catch (error) {
    // @ts-ignore
    if (error.code === 'ER_DUP_ENTRY') {
      throw new CustomError('The user is already linked to the institution', 409)
    } else {
      throw error
    }
  }

  if (!userId)
    return { usuario: user }
}

const updateUser = async(id: number, user: any, rol: string) => {
  if (user.email) {
    await mailer.checkEmail(user.email)
  }
  if(user.password) {
    user.password = await createHash(user.password)
  }
  if(rol == 'admin') {
    await knex('admins_cyt').where({id: id}).update(user)
    return await getOneAdmin(id)
  } else {
    await knex(TABLE_EVALUADORES).where({ id: id }).update(user)
    return await getOneUser(id)
  }
}

export default {
  getAllAdmins,
  getAllEvaluadores,
  getAllInstitutionUsers,
  getUserByDni,
  createUser,
  linkUserToInstitution,
  updateUser,
  getOneUser
}