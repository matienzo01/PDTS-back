import bcrypt from 'bcrypt';
import knex from '../database/knex';
import jwt from 'jsonwebtoken';
import { UserForToken } from '../types/UserForToken';
import { CustomError } from '../types/CustomError';

const login = async (mail: string, password: string) => {

  const tablesToCheck = [
    { rol: 'admin general', tableName: 'admin', columns: ['email', 'password'] },
    { rol: 'admin', tableName: 'admins_cyt', columns: ['id', 'email', 'password', 'nombre', 'apellido'] },
    { rol: 'evaluador', tableName: 'evaluadores', columns: ['id', 'email', 'password', 'nombre', 'apellido'] }
  ];

  let user: any = null;

  for (const table of tablesToCheck) {
    user = await knex(table.tableName).select(...table.columns).where({ email: mail }).first();
    if (user) {
      user.rol = table.rol
      if (table.tableName === 'admin') {
        user.id = 1;
      } else if (table.tableName === 'admins_cyt') {
        user.institutionId = (await knex('instituciones_cyt').select('id').where({ id_admin: user.id }).first()).id
      }
      break;
    }
  }

  if(!user){
    throw new CustomError('Invalid user or password', 401)
  }

  const passwordCorrect = user === undefined
    ? false
    : await bcrypt.compare(password, user.password)

  delete user.password
  if (!passwordCorrect) {
    throw new CustomError('Invalid user or password', 401)
  }

  const userForToken: UserForToken = {
    id: user.id,
    mail: user.email,
    rol: user.rol,
    institutionId: user.institutionId,
    nombre: user.nombre,
    apellido: user.apellido
  }

  const token = jwt.sign(userForToken, process.env.SECRET || 'clave')
  return { token: token, user: userForToken }
}

export default {
  login
};