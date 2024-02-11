const gen_consulta = require('../database/gen_consulta')
const knex = require('../database/knex')
const TABLA = 'instituciones'

const getOneInstitucion = async (id_institucion) => {
  const condiciones = [`id = ${id_institucion}`]
  try {
    return await gen_consulta._select(TABLA, null, condiciones)
  } catch (error) {
    throw error;
  }
}

const getAllInstituciones = async () => {
  try {
    return await gen_consulta._select(TABLA, null, null)
  } catch (error) {
    throw error;
  }
}

const createInstitucion = async (newAdmin, institucion) => {

  const institutions_table = `instituciones`
  const admins_table = 'admins_cyt(nombre,apellido,email,password)'
  const conds = [
    `nombre = '${institucion.nombre}'`,
    `pais = '${institucion.pais}'`,
    `provincia = '${institucion.provincia}'`,
    `localidad = '${institucion.localidad}'`,
  ]

  const exists = await gen_consulta._select(institutions_table, null, conds)
  if (exists[0] === undefined) //no existe todavia la institucion
  {
    try {
      const admin = await gen_consulta._insert(admins_table, Object.values(newAdmin))

      const newInstitution = {
        id_tipo: institucion.id_tipo, //esto habria que cambiarlo creo
        id_admin: admin.insertId,
        nombre: institucion.nombre,
        pais: institucion.pais,
        provincia: institucion.provincia,
        localidad: institucion.localidad,
        telefono_institucional: institucion.telefono_institucional,
        mail_institucional: institucion.mail_institucional
      }

      return await gen_consulta._insert(institutions_table
        .concat('(id_tipo,id_Admin,nombre,pais,provincia,localidad,telefono_institucional,mail_institucional)'),
        Object.values(newInstitution))

    } catch (error) {
      throw error;
    }
  }
  return 'ya existe esa institucion';
}

const deleteInstitucion = async (id) => {
  knex.transaction(async (trx) => {
    await trx('instituciones').where({ id }).del()
    await trx('admins_cyt').where({ id }).del()
  })
  return;
}

const getAllRoles = async () => {
  try {
    return await knex.select().from('pdts.roles_instituciones')
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getOneInstitucion,
  getAllInstituciones,
  createInstitucion,
  deleteInstitucion,
  getAllRoles
}