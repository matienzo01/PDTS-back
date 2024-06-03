import Knex from 'knex';

const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
});;

export default knex;
