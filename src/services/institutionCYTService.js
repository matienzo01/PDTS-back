const knex = require('../database/knex')
const TABLE_INSTITUCIONES = 'instituciones'
const TABLE_INSTITUCIONES_CYT = 'instituciones_cyt'

const getOneInstitucionCYT = async (id) => {

  const [tipos_inst,inst] = await Promise.all([
    knex('tipos_instituciones').select(),
    knex(TABLE_INSTITUCIONES)
      .select('*')
      .innerJoin(TABLE_INSTITUCIONES_CYT, 'instituciones.id', 'instituciones_cyt.id')
      .where('instituciones.id',id)
  ])

  if (inst[0] === undefined) {
    const _error = new Error('There is no institution with that id')
    _error.status = 404
    throw _error
  }

  const tipoCorrespondiente = tipos_inst.find(tipo => tipo.id === inst[0].id_tipo);
  if (tipoCorrespondiente) {
    inst[0].tipo = tipoCorrespondiente.tipo;
    delete inst[0].id_tipo;
  }

  return {institucion_CYT: inst[0]}
}

const getAllInstitucionesCYT = async () => {
  const [tipos_inst,inst] = await Promise.all([
    knex('tipos_instituciones').select(),
    knex(TABLE_INSTITUCIONES)
      .select('*')
      .innerJoin(TABLE_INSTITUCIONES_CYT, 'instituciones.id', 'instituciones_cyt.id')
  ])

  inst.forEach(institucion => {
    const tipoCorrespondiente = tipos_inst.find(tipo => tipo.id === institucion.id_tipo);
    if (tipoCorrespondiente) {
      institucion.tipo = tipoCorrespondiente.tipo;
      delete institucion.id_tipo;
    }
  });
  return {instituciones_CYT: inst}
}

const getTiposInstituciones = async() => {
  const tipos = await knex('tipos_instituciones').select()
  return {tipos: tipos}
}

const createInstitucionCYT = async (newAdmin, institucion) => {

  const exists = await knex(TABLE_INSTITUCIONES).select()
    .where({nombre: institucion.nombre,
            pais: institucion.pais,
            provincia: institucion.provincia,
            localidad: institucion.localidad})

  if (exists[0] === undefined) //no existe todavia la institucion
  { 
    const adminId = await knex('admins_cyt').insert(newAdmin)

    const newInst = {
      nombre: institucion.nombre,
      rubro: institucion.rubro,
      pais: institucion.pais,
      provincia: institucion.provincia,
      localidad: institucion.localidad,
      telefono_institucional: institucion.telefono_institucional,
      mail_institucional: institucion.mail_institucional
    }

    const instId = await knex(TABLE_INSTITUCIONES).insert(newInst)

    const newInstCyt = {
      id: instId[0],
      id_admin: adminId[0],
      id_tipo: institucion.id_tipo, //hay que fijarnos que exista el tipo a insertar
      nombre_referente: institucion.nombre_referente,
      apellido_referente: institucion.apellido_referente,
      cargo_referente: institucion.cargo_referente,
      telefono_referente: institucion.telefono_referente,
      mail_referente: institucion.mail_referente
    }

    await knex(TABLE_INSTITUCIONES_CYT).insert(newInstCyt)

    const inst = await getOneInstitucionCYT(instId[0])
    return inst
  } else {
    throw new Error('The institution already exists in the system')
  }
}

const deleteInstitucionCYT = async (id) => {
  knex.transaction(async (trx) => {
    await trx(TABLE_INSTITUCIONES_CYT).where({id}).del()
    await trx(TABLE_INSTITUCIONES).where({ id }).del()
    await trx('admins_cyt').where({ id }).del()
  })
  return;
}

module.exports = {
  getOneInstitucionCYT,
  getAllInstitucionesCYT,
  createInstitucionCYT,
  deleteInstitucionCYT,
  getTiposInstituciones
}