import knex from '../database/knex';

const getPaises = async() => {
    return await knex('paises')
}

const getProvincias = async () => {
    const provincias = await knex('provincias');
    await Promise.all(provincias.map(async (p) => {
        p.localidades = await getLocalidades(p.id);
    }));
    return provincias;
}

const getLocalidades = async(id_provincia: number) => {
    return await knex('localidades').where({id_provincia}).select('id','localidad')
}

const getAllLocalidades = async() => {
    return await knex('localidades')
}

export default {
    getLocalidades,
    getAllLocalidades,
    getPaises,
    getProvincias
}