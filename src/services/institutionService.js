const knex = require('../database/knex.js')
const TABLE_INSTITUCIONES = 'instituciones'

const getInstituciones = async() => {
    return {instituciones: await knex.select().from(TABLE_INSTITUCIONES)};
  }   
  
const getOneInstitucion = async(id) => {
  const inst = await knex.select().where({id}).from(TABLE_INSTITUCIONES).first()
  if(inst === undefined) {
      const _error = new Error('There is no institution with the provided id ')
      _error.status = 404
      throw _error
  }
  return {institucion: inst}
}  
  
const createInstitucion = async(institution) => {
  const insertId = parseInt(await knex(TABLE_INSTITUCIONES).insert(institution))
  return await getOneInstitucion(insertId)  
}  

module.exports = {
    getInstituciones,
    getOneInstitucion,
    createInstitucion
}