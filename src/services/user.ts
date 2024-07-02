import { Evaluador } from "../types/Evaluador"
import { CustomError } from "../types/CustomError"
import knex from '../database/knex'
import bcrypt from 'bcrypt'
import mailer from './mailer'
const TABLE_EVALUADORES = 'evaluadores'
import institutuionService from './institutionCYT'

const adminPerteneceInstitucion = async(id_institucion: number, id_admin: number) => {
  return (await knex('instituciones_x_admins').select().where({id_institucion, id_admin})).length == 1
}

const getAllAdmins = async() => {
  const admins = await knex('admins_cyt as a')
    .join('instituciones_x_admins as ixa', 'ixa.id_admin', 'a.id' )
    .join('instituciones_cyt as icyt','icyt.id','ixa.id_admin')
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

const getAllInstitutionAdmins = async (id_institucion: number) => {
  if (await knex('instituciones_cyt').select().where({ id: id_institucion }).first() === undefined) {
    throw new CustomError('There is no institution with the provided id', 404)
  }

  return {administradores: await knex('instituciones_x_admins as ixa')
    .join('admins_cyt as a', 'a.id', 'ixa.id_admin')
    .where('ixa.id_institucion', id_institucion)
    .select(
      'a.id',
      'a.nombre',
      'a.apellido',
      'a.email',
      'a.dni'
    )}
}

const createAdmin = async(institutionId: number, newAdmin: any) => {
  const inst = (await institutuionService.getOneInstitucionCYT(institutionId)).institucion_CYT
  if(await knex('admins_cyt').select().where({dni: newAdmin.dni}).first() != undefined) {
    throw new CustomError('There is already an admin with that DNI', 409)
  }

  await mailer.checkEmail(newAdmin.email)

  const trx = await knex.transaction()
  try {
    const oldpass = newAdmin.dni;
    newAdmin.password = await createHash(oldpass);
    const insertId = (await trx('admins_cyt').insert(newAdmin))[0];
    await trx('instituciones_x_admins').insert({id_institucion: institutionId, id_admin: insertId})
    await trx.commit()
    mailer.sendNewInst(newAdmin, inst)
    return await getOneAdmin(insertId)
  } catch (error) {
    await trx.rollback()
  }
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

  if(await knex('evaluadores').select().where({dni: newUser.dni}).first() != undefined) {
    throw new CustomError('There is already a user with that DNI', 409)
  }

  try {
    await getUserByDni(newUser.dni) // debe dar un 404 para asegurarnos de que no exista previamente el usuario
    throw new CustomError('There is already a user with that DNI', 409)
  } catch (error) {
    if ((error as CustomError).status !== 404) {
      throw error
    }
  }

  await mailer.checkEmail(newUser.email)

  const trx = await knex.transaction()
  try {
    const oldpass = newUser.dni;
    newUser.password = await createHash(oldpass);
    const insertId = (await trx(TABLE_EVALUADORES).insert(newUser))[0];
    await linkUserToInstitution(newUser.dni, institutionId, insertId, trx);
    await trx.commit()
    mailer.sendNewUser(newUser)
    return await getOneUser(insertId)
  } catch (error) {
    await trx.rollback()
  }
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
  const userActual = rol === 'admin' ? (await getOneAdmin(id)).admin : (await getOneUser(id)).usuario;

  if (user.email && user.email !== userActual.email) {
    await mailer.checkEmail(user.email);
  }

  const userToUpdate: any = {
    email:  user.email,
    nombre: user.nombre,
    apellido: user.apellido,
  }

  if(user.password) {
    userToUpdate.password = await createHash(user.password)
  }

  if(rol == 'admin') {
    await knex('admins_cyt').where({id: id}).update(userToUpdate)
    return await getOneAdmin(id)
  }

  userToUpdate.celular = user.celular
  userToUpdate.institucion_origen = user.institucion_origen
  userToUpdate.pais_residencia = user.pais_residencia
  userToUpdate.provincia_residencia = user.provincia_residencia
  userToUpdate.localidad_residencia = user.localidad_residencia
  userToUpdate.especialidad = user.especialidad

  await knex(TABLE_EVALUADORES).where({ id: id }).update(userToUpdate)
  return await getOneUser(id)
}

const deleteAdminCyT = async(id_institucion: number, id_admin: number) => {
  await getOneAdmin(id_admin)

  const cant = (await knex('instituciones_x_admins').select().where({id_institucion})).length
  console.log(cant)
  if (cant < 2) {
    throw new CustomError('The institution must have al least one administrator', 403)
  }

  return await knex.transaction(async (trx: any) => {
    await trx('instituciones_x_admins').where({id_admin, id_institucion}).del()
    await trx('admins_cyt').where({id: id_admin}).del()
    return ;
  })
}

const createAdminGeneral = async(newAdmin: any) => {
  await mailer.checkEmail(newAdmin.email)
  newAdmin.password = await createHash(newAdmin.password)

  await knex('admin').insert(newAdmin)
  return { administrador : (await knex('admin').select('email').where({email: newAdmin.email}))[0]}
}

const deleteAdminGeneral = async(id: number) => {

}

const getAllAdminsGenerales = async() => {
  return {administradores: await knex('admin').select('email')}
}

//hay que cambiar esto para que sea con el id, pero como requiere un refactor de la base de datos mejor esperar
const getOneAdminGeneral = async(id: number) => {
  const admin = await knex('admin').select().where({id})
  if (admin == undefined) {
    throw new CustomError('There is not admin with the provided id', 404)
  }
  return { admin_general: admin}
}

export default {
  getAllAdmins,
  getAllEvaluadores,
  getAllInstitutionUsers,
  getAllInstitutionAdmins,
  getUserByDni,
  createUser,
  createAdmin,
  createAdminGeneral,
  linkUserToInstitution,
  updateUser,
  getOneUser,
  getOneAdmin,
  deleteAdminGeneral,
  deleteAdminCyT,
  getAllAdminsGenerales,
  getOneAdminGeneral,
  adminPerteneceInstitucion
}