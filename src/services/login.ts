import bcrypt from 'bcrypt';
import knex from '../database/knex';
import jwt from 'jsonwebtoken';
import { UserForToken } from '../types/UserForToken';
import { CustomError } from '../types/CustomError';

const login = async (email: string, password: string) => {

  const tablesToCheck = [
    { rol: 'admin general', tableName: 'admin', columns: ['id','email', 'password'] },
    { rol: 'admin', tableName: 'admins_cyt', columns: ['id', 'email', 'password', 'nombre', 'apellido', 'dni'] },
    { rol: 'evaluador', tableName: 'evaluadores', columns: ['id', 'email', 'password', 'nombre', 'apellido', 'dni'] }
  ];

  let user: any = null;

  for (const table of tablesToCheck) {
    user = await knex(table.tableName).select(...table.columns).where({ email: email }).first();
    if (user) {
      user.rol = table.rol
      if (table.tableName === 'admins_cyt') {
        user.institutionId = (await knex('instituciones_x_admins').select('id_institucion as id').where({ id_admin: user.id }).first()).id
      }
      break;
    }
  }

  if(!user){
    throw new CustomError('usuario o contraseña invalido', 401)
  }

  const passwordCorrect = user === undefined
    ? false
    : await bcrypt.compare(password, user.password)

  delete user.password
  if (!passwordCorrect) {
    throw new CustomError('usuario o contraseña invalido', 401)
  }

  const userForToken: UserForToken = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    institutionId: user.institutionId,
    nombre: user.nombre,
    apellido: user.apellido,
    dni : user.dni
  }

  const token = jwt.sign(userForToken, process.env.SECRET || 'clave')
  return { token: token, user: userForToken }
}

export default {
  login
};