import knex from '../database/knex';
import { CustomError } from '../types/CustomError';
import { Institucion } from '../types/Institucion';
const TABLE_INSTITUCIONES = 'instituciones'

const getInstituciones = async() => {
    return {instituciones: await knex.select().from(TABLE_INSTITUCIONES)};
  }   
  
const getOneInstitucion = async(id: number) => {
  const inst = await knex.select().where({id}).from(TABLE_INSTITUCIONES).first()
  if(inst === undefined) {
    throw new CustomError('There is no institution with the provided id', 404)
  }
  return {institucion: inst}
}  
  
const createInstitucion = async(institution: Institucion) => {
  const insertId = parseInt(await knex(TABLE_INSTITUCIONES).insert(institution))
  return await getOneInstitucion(insertId)  
}  

export default {
    getInstituciones,
    getOneInstitucion,
    createInstitucion
}