import knex from '../database/knex';
import { CustomError } from '../types/CustomError';
import { Institucion } from '../types/Institucion';
const TABLE_INSTITUCIONES = 'instituciones'

const getTiposInstituciones = async () => {
  const tipos = await knex('tipos_instituciones').select().where('tipo','<>','cyt')
  return { tipos: tipos }
}

const getRubros = async() => {
  const rubros = await knex('rubros').select().where('nombre','<>','cyt')
  return { rubros: rubros}
}

const createRubro = async(nombre: string) => {
  if((await knex('rubros').select().where({nombre})).length > 0){
    throw new CustomError("The 'Rubro' already exists", 409)
  } 
  const insertId = parseInt(await knex('rubros').insert({nombre: nombre}))
  return await knex('rubros').select().where({id: insertId})
}

const verify = async(id: number) => {
  if(id == 1) {
    throw new CustomError("Unable to delete or update the 'rubro'", 409)
  }
  if ((await knex('rubros').select().where({id})).length == 0 ){
    throw new CustomError("The 'rubro' doesnt exist", 404)
  }
}

const updateRubro = async(id:number, updatedRubro: any) => {
  await verify(id)
  await knex('rubros').where({ id}).update(updatedRubro)
  return await knex('rubros').select().where({id: id})
}

const deleteRubro = async(id: number) => {
  await verify(id)
  await knex('rubros').where({id}).delete()
  return await getRubros()
}

const getInstituciones = async() => {
  const [instituciones, tipos_inst, rubros] = await Promise.all([
    await knex.select().from(TABLE_INSTITUCIONES),
    knex('tipos_instituciones'),
    knex('rubros')
  ])

  await Promise.all(instituciones.map( async (inst) => {
    const { tipo, rubro} = await setTipoyRubro(inst, tipos_inst, rubros)
    inst.tipo = tipo
    inst.rubro = rubro
    delete inst.id_tipo
    delete inst.id_rubro
  }))

  return {instituciones: instituciones};
}   

const setTipoyRubro= async(inst: any, tipos_inst: any, rubros: any) => {
  let tipo
  let rubro


  const tipoCorrespondiente = tipos_inst.find((tipo: any) => tipo.id === inst.id_tipo);
  if (tipoCorrespondiente) {
    tipo = tipoCorrespondiente.tipo;
  }

  const rubroCorrespondiente = rubros.find((rubro: any) => rubro.id === inst.id_rubro);
  if (rubroCorrespondiente) {
    rubro = rubroCorrespondiente.nombre;
  }
  
  return {tipo, rubro}
}

const getOneInstitucion = async(id: number) => {

  const [inst, tipos_inst, rubros] = await Promise.all([
    knex.select().where({id}).from(TABLE_INSTITUCIONES).first(),
    knex('tipos_instituciones'),
    knex('rubros')
  ])

  if(inst === undefined) {
    throw new CustomError('There is no institution with the provided id', 404)
  }

  const { tipo, rubro} = await setTipoyRubro(inst, tipos_inst, rubros)
  inst.tipo = tipo
  inst.rubro = rubro
  delete inst.id_tipo
  delete inst.id_rubro

  return {institucion: inst}
}  
  
const createInstitucion = async(institution: Institucion) => {
  const insertId = parseInt(await knex(TABLE_INSTITUCIONES).insert(institution))
  return await getOneInstitucion(insertId)  
}  

export default {
    getInstituciones,
    getOneInstitucion,
    createInstitucion,
    getRubros,
    getTiposInstituciones,
    createRubro,
    updateRubro,
    deleteRubro
}