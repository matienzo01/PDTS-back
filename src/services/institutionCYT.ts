import knex from '../database/knex'
import projectService from './project'
import bcrypt from 'bcrypt'
import mailer from './mailer'
import { CustomError } from '../types/CustomError'
const TABLE_INSTITUCIONES = 'instituciones'
const TABLE_INSTITUCIONES_CYT = 'instituciones_cyt'

const getInstIdFromAdmin = async (id_admin: number) => {
  const { id } =  await knex('instituciones_cyt').select('id').where({ id_admin }).first()
  if ( id == undefined) {
    throw new CustomError('There is no institution with that admin id', 404)
  }
  return id
}

const getOneInstitucionCYT = async (id: number , trx: any = null) => {
  const queryBuilder = trx || knex;
  const inst = await queryBuilder(TABLE_INSTITUCIONES)
    .select('*')
    .innerJoin(TABLE_INSTITUCIONES_CYT, 'instituciones.id', 'instituciones_cyt.id')
    .where('instituciones.id', id)
    .first()
  
  if (inst === undefined) {
    throw new CustomError('There is no institution with that id', 404)
  }

  delete inst.id_rubro
  delete inst.id_tipo

  return { institucion_CYT: inst }
}

const getAllInstitucionesCYT = async () => {
  const inst = await knex(TABLE_INSTITUCIONES)
    .select('*')
    .innerJoin(TABLE_INSTITUCIONES_CYT, 'instituciones.id', 'instituciones_cyt.id')

  inst.forEach(institucion => {
    delete institucion.id_rubro
    delete institucion.id_tipo
  });
  return { instituciones_CYT: inst }
}

const createHash = async (password: string) => {
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

const createInstitucionCYT = async (newAdmin: any, institucion: any) => {

  const exists = await knex(TABLE_INSTITUCIONES).select()
    .where({
      nombre: institucion.nombre,
      pais: institucion.pais,
      provincia: institucion.provincia,
      localidad: institucion.localidad
    })

  if (exists[0] === undefined) //no existe todavia la institucion
  {
    const id_inst = await knex.transaction(async (trx) => {
      await mailer.checkEmail(newAdmin.email, trx)
      const oldpass = newAdmin.dni
      newAdmin.password = await createHash(oldpass)
      const adminId = (await trx('admins_cyt').insert(newAdmin))[0];

      const newInst = {
        nombre: institucion.nombre,
        id_rubro: 1,
        id_tipo: 1,
        pais: institucion.pais,
        provincia: institucion.provincia,
        localidad: institucion.localidad,
        telefono_institucional: institucion.telefono_institucional,
        mail_institucional: institucion.mail_institucional,
        esCyt: true
      }

      const instId = (await trx(TABLE_INSTITUCIONES).insert(newInst))[0];

      const newInstCyt = {
        id: instId,
        id_admin: adminId,
        nombre_referente: institucion.nombre_referente,
        apellido_referente: institucion.apellido_referente,
        cargo_referente: institucion.cargo_referente,
        telefono_referente: institucion.telefono_referente,
        mail_referente: institucion.mail_referente
      }

      await trx(TABLE_INSTITUCIONES_CYT).insert(newInstCyt)

      await mailer.sendNewInst(newAdmin, newInst)

      return instId
    })
    return await getOneInstitucionCYT(id_inst)
  } else {
    throw new Error('The institution already exists in the system')
  }
}

const deleteInstitucionCYT = async (id: number) => {
  return knex.transaction(async (trx) => {
    const { id_admin } = (await getOneInstitucionCYT(id, trx)).institucion_CYT;
    const { proyectos } = await projectService.getAllProjects(id);
    const participaciones = await trx('participacion_instituciones').where({id_institucion: id})

    if (proyectos.length != 0 || participaciones.length > 0) {
      throw new CustomError("The institution cannot be deleted, you must first make sure that it does not have any projects in it or that it does not participate in projects of other institutions", 409);
    } else {
      await trx('evaluadores_x_instituciones').del().where({ id_institucion: id });
      await trx(TABLE_INSTITUCIONES_CYT).where({ id }).del();
      await trx(TABLE_INSTITUCIONES).where({ id }).del();
      await trx('admins_cyt').where({ id: id_admin }).del();
    }
  });
};



export default {
  getOneInstitucionCYT,
  getAllInstitucionesCYT,
  createInstitucionCYT,
  deleteInstitucionCYT,
  getInstIdFromAdmin
}