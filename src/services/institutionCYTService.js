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
      .first()
  ])

  console.log(inst)
  if (inst === undefined) {
    const _error = new Error('There is no institution with that id')
    _error.status = 404
    throw _error
  }

  const tipoCorrespondiente = tipos_inst.find(tipo => tipo.id === inst.id_tipo);
  if (tipoCorrespondiente) {
    inst.tipo = tipoCorrespondiente.tipo;
    delete inst.id_tipo;
  }

  return {institucion_CYT: inst}
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
    const id_inst = await knex.transaction(async (trx) => {
      const adminId = (await trx('admins_cyt').insert(newAdmin))[0];

      const newInst = {
        nombre: institucion.nombre,
        rubro: institucion.rubro,
        pais: institucion.pais,
        provincia: institucion.provincia,
        localidad: institucion.localidad,
        telefono_institucional: institucion.telefono_institucional,
        mail_institucional: institucion.mail_institucional
      }

      const instId = (await trx(TABLE_INSTITUCIONES).insert(newInst))[0];

      const newInstCyt = {
        id: instId,
        id_admin: adminId,
        id_tipo: institucion.id_tipo, //hay que fijarnos que exista el tipo a insertar
        nombre_referente: institucion.nombre_referente,
        apellido_referente: institucion.apellido_referente,
        cargo_referente: institucion.cargo_referente,
        telefono_referente: institucion.telefono_referente,
        mail_referente: institucion.mail_referente
      }

      await trx(TABLE_INSTITUCIONES_CYT).insert(newInstCyt)
      return instId
    })
    return await getOneInstitucionCYT(id_inst)
  } else {
    throw new Error('The institution already exists in the system')
  }
}

const deleteInstitucionCYT = async (id) => {
  knex.transaction(async (trx) => {
    const {id_admin} = await trx(TABLE_INSTITUCIONES_CYT).select('id_admin').where({id}).first()
    await trx(TABLE_INSTITUCIONES_CYT).where({id}).del()
    await trx(TABLE_INSTITUCIONES).where({ id }).del()
    await trx('admins_cyt').where({ id: id_admin }).del()
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