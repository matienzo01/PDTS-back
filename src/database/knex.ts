import Knex from 'knex';

const knex = Knex({
  client: 'mysql',
  connection: {
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DATABASE || 'pdts'
  }
});

export default knex;
