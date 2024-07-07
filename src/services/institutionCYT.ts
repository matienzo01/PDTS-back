import knex from '../database/knex'
import projectService from './project'
import institutionService from './institution'
import bcrypt from 'bcrypt'
import mailer from './mailer'
import { CustomError } from '../types/CustomError'
const TABLE_INSTITUCIONES = 'instituciones'
const TABLE_INSTITUCIONES_CYT = 'instituciones_cyt'

const getInstIdFromAdmin = async (id_admin: number) => {
  const rel =  await knex('instituciones_x_admins').select('id_institucion').where({ id_admin }).first()
  if ( rel.id_institucion == undefined) {
    throw new CustomError('There is no institution with that admin id', 404)
  }
  return rel.id_institucion
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
        nombre_referente: institucion.nombre_referente,
        apellido_referente: institucion.apellido_referente,
        cargo_referente: institucion.cargo_referente,
        telefono_referente: institucion.telefono_referente,
        mail_referente: institucion.mail_referente
      }

      await trx(TABLE_INSTITUCIONES_CYT).insert(newInstCyt)
      await trx('instituciones_x_admins').insert({id_institucion: instId, id_admin: adminId})

      await mailer.sendNewInst(newAdmin, newInst)

      return instId
    })
    return await getOneInstitucionCYT(id_inst)
  } else {
    throw new CustomError('The institution already exists in the system', 409)
  }
}

const deleteInstitucionCYT = async (id: number) => {
  if ((await knex('instituciones_cyt').where({id})).length == 0) {
    throw new CustomError('There is no institution with the provided id', 404)
  }

  return knex.transaction(async (trx) => {
    const admins =  (await trx('instituciones_x_admins')
      .select()
      .where({id_institucion: id}))
        .map(p => p.id_admin)

    const { proyectos } = await projectService.getAllInstitutionProjects(id);
    const participaciones = await trx('participacion_instituciones').where({id_institucion: id})

    if (proyectos.length != 0 || participaciones.length > 0) {
      throw new CustomError("The institution cannot be deleted, you must first make sure that it does not have any projects in it or that it does not participate in projects of other institutions", 409);
    } else {
      await trx('evaluadores_x_instituciones').del().where({ id_institucion: id });
      await trx('instituciones_x_admins').where({id_institucion: id}).del();
      await trx(TABLE_INSTITUCIONES_CYT).where({ id }).del();
      await trx(TABLE_INSTITUCIONES).where({ id }).del();
      await trx('admins_cyt').whereIn('id', admins).del();
    }
  });
};

const updateInstitucionCYT = async(id_institucion: number, institucion: any) => {
  return knex.transaction(async (trx) => {
    //me aseguro que no existan estos atributos para que no haya error
    delete institucion.id_tipo
    delete institucion.id_rubro
    await institutionService.updateInstitucion(id_institucion, institucion, trx)
    await trx('instituciones_cyt')
      .where({id: id_institucion})
      .update({
        nombre_referente: institucion.nombre_referente,
        apellido_referente: institucion.apellido_referente,
        cargo_referente: institucion.cargo_referente,
        telefono_referente: institucion.telefono_referente,
        mail_referente: institucion.mail_referente
      })
    return await getOneInstitucionCYT(id_institucion, trx);
  })
}

export default {
  getOneInstitucionCYT,
  getAllInstitucionesCYT,
  createInstitucionCYT,
  deleteInstitucionCYT,
  getInstIdFromAdmin,
  updateInstitucionCYT
}