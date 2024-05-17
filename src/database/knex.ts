import Knex from 'knex';


const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: '179.43.115.86',
    user: 'seva',
    password: '20ProySe-va24',
    database: 'seva-pdts'
  }
});

/*
const knex = Knex({
  client: 'mysql',
  connection: {
    port: 3306,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pdts'
  }
});*/


export default knex;
