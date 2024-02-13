const knex = require('../database/knex')
const TABLE = 'instituciones'

const getOneInstitucion = async (id_institucion) => {
  const inst = await knex(TABLE).select().where({id: id_institucion})
  const tipos_inst = await knex('tipos_instituciones').select()

  const tipoCorrespondiente = tipos_inst.find(tipo => tipo.id === inst[0].id_tipo);
  if (tipoCorrespondiente) {
    inst[0].tipo = tipoCorrespondiente.tipo;
    delete inst[0].id_tipo;
  }

  return {institucion: inst[0]}
}

const getAllInstituciones = async () => {
  const inst = await knex(TABLE).select()
  const tipos_inst = await getTiposInstituciones()
  
  inst.forEach(institucion => {
    const tipoCorrespondiente = tipos_inst.find(tipo => tipo.id === institucion.id_tipo);
    if (tipoCorrespondiente) {
      institucion.tipo = tipoCorrespondiente.tipo;
      delete institucion.id_tipo;
    }
  });

  return {instituciones: inst}
}

const getTiposInstituciones = async() => {
  return await knex('tipos_instituciones').select()
}

const createInstitucion = async (newAdmin, institucion) => {

  const exists = await knex(TABLE).select()
    .where({nombre: institucion.nombre,
            pais: institucion.pais,
            provincia: institucion.provincia,
            localidad: institucion.localidad})

  if (exists[0] === undefined) //no existe todavia la institucion
  { 
    const adminId = await knex('admins_cyt').insert(newAdmin)
    institucion.id_admin = adminId[0]

    const instId = await knex(TABLE).insert(institucion)
    const inst = await knex(TABLE).select().where({id: instId[0]})
    return {institucion: inst[0]}
  } else {
    throw new Error('The institution already exists in the system')
  }
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