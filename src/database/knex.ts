import Knex from 'knex';

const knex = Knex({
  client: 'mysql',
  connection: {
    port: 2086,
    host: 'localhost',
    user: 'seva',
    password: '20ProySe-va24',
    database: 'seva-pdts'
  }
});

export default knex;
